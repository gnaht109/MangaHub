package com.mangahub.backend.service;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.mangahub.backend.dto.request.FlashSaleCreateRequest;
import com.mangahub.backend.dto.request.FlashSaleItemCreateRequest;
import com.mangahub.backend.dto.response.FlashSaleResponse;
import com.mangahub.backend.enums.FlashSaleStatus;
import com.mangahub.backend.exception.AppException;
import com.mangahub.backend.exception.ErrorCode;
import com.mangahub.backend.mapper.FlashSaleMapper;
import com.mangahub.backend.model.FlashSale;
import com.mangahub.backend.model.FlashSaleItem;
import com.mangahub.backend.model.Manga;
import com.mangahub.backend.model.User;
import com.mangahub.backend.repository.FlashSaleRepository;
import com.mangahub.backend.repository.MangaRepository;
import com.mangahub.backend.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service 
@RequiredArgsConstructor 
public class FlashSaleService {
    
    private final UserRepository userRepository;
    private final FlashSaleRepository flashSaleRepository;
    private final FlashSaleMapper mapper;
    private final MangaRepository mangaRepository;

    public List<FlashSaleResponse> getAll() {
        return mapper.toFlashSaleResponses(
            flashSaleRepository.findAllByOrderByStartDateDesc()
        );
    }

    public List<FlashSaleResponse> getActive() {
        return mapper.toFlashSaleResponses(
            flashSaleRepository.findActiveOn(LocalDate.now())
        );
    }

    public FlashSaleResponse getById(String id) {
        return flashSaleRepository.findById(id)
        .map(mapper::toFlashSaleResponse)
        .orElseThrow(() -> new AppException(ErrorCode.MANGA_NOT_FOUND));
    }

    @Transactional 
    public FlashSaleResponse createFlashSale(FlashSaleCreateRequest request) {
        // trim empty space
        request.setName(request.getName().trim());

        // validate dates
        LocalDate startDate = request.getStartDate();
        LocalDate endDate = request.getEndDate();

        if(endDate.isBefore(startDate)) {
            throw new AppException(ErrorCode.INVALID_FLASH_SALE_DATES);
        }
        if(endDate.isBefore(LocalDate.now())) {
            throw new AppException(ErrorCode.INVALID_FLASH_SALE_DATES);
        }

        // check if flash sale name alr exists
        if(flashSaleRepository.existsByNameIgnoreCase(request.getName().trim())) {
            throw new AppException(ErrorCode.FLASH_SALE_ALREADY_EXISTS);
        }

        // create flash sale from mapper
        FlashSale flashSale = mapper.toEntityFlashSale(request);

        // status is set depending on the date
        flashSale.setStatus(resolveStatus(startDate, endDate));
        
        // who created the flashsale
        flashSale.setUser(getUser());

        // add items and save flashsale
        addItems(flashSale, request.getItems());
        flashSaleRepository.save(flashSale);

        FlashSaleResponse response = mapper.toFlashSaleResponse(flashSale);
        response.setStatus(flashSale.getStatus());
        return response;
    }

    @Transactional 
    public FlashSaleResponse cancelFlashSale(String id) {
        FlashSale flashSale = flashSaleRepository.findById(id)
                    .orElseThrow(() -> new AppException(ErrorCode.FLASH_SALE_NOT_FOUND));
        
        // check if flash sale has alr ended or alr been cancelled
        boolean ended = LocalDate.now().isAfter(flashSale.getEndDate());
        if(ended || flashSale.getStatus() == FlashSaleStatus.CANCELLED) {
            throw new AppException(ErrorCode.FLASH_SALE_ALREADY_ENDED);
        }

    
        flashSale.setStatus(FlashSaleStatus.CANCELLED);
        return mapper.toFlashSaleResponse(flashSale);
    }


    // get user from SecurityContextHolder, use repository, not User entity
    private User getUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if(authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        return userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    // date handler
    private static FlashSaleStatus resolveStatus(LocalDate startDate, LocalDate endDate) {
        LocalDate today = LocalDate.now();

        if(today.isBefore(startDate)) {
            return FlashSaleStatus.UPCOMING;
        }
        if(today.isAfter(endDate)) {
            return FlashSaleStatus.ENDED;
        }

        return FlashSaleStatus.ACTIVE;
    }

    private void addItems(FlashSale flashSale, List<FlashSaleItemCreateRequest> items) {
        if(items == null || items.isEmpty()) {
            return;
        }

        // check for manga duplicates
        Set<String> mangaIds = new HashSet<>();
        for(FlashSaleItemCreateRequest item : items) {
            // add() returns false if there is a duplicate
            if(!mangaIds.add(item.getMangaId())) {
                throw new AppException(ErrorCode.DUPLICATE_FLASH_SALE_ITEM);
            }
        }

        // get and map out mangas with their id
        Map<String, Manga> mangaById = mangaRepository.findAllById(mangaIds)
                            .stream().collect(Collectors.toMap(manga -> manga.getId(), Function.identity()));

        // check if any manga is missing from the items
        if(mangaById.size() != mangaIds.size()) {
            throw new AppException(ErrorCode.MANGA_NOT_FOUND);
        }

        // add mangas
        for(FlashSaleItemCreateRequest item : items) {
            Manga manga = mangaById.get(item.getMangaId());

            // discounted price must be lower than base price
            if(item.getDiscountedPrice().compareTo(manga.getBasePrice()) >= 0) {
                throw new AppException(ErrorCode.INVALID_DISCOUNTED_PRICE);
            }

            FlashSaleItem flashSaleItem = mapper.toEntityFlashSaleItem(item);
            flashSaleItem.setManga(manga);
            flashSaleItem.setFlashSale(flashSale);

            // cascade = ALL saves the items with the sale
            flashSale.getItems().add(flashSaleItem);
        }
    }
}
