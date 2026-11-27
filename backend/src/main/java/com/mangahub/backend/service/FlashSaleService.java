package com.mangahub.backend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
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
import com.mangahub.backend.dto.request.UpdateFlashSaleItemRequest;
import com.mangahub.backend.dto.request.UpdateFlashSaleRequest;
import com.mangahub.backend.dto.request.AddFlashSaleItemRequest;
import com.mangahub.backend.dto.response.FlashSaleResponse;
import com.mangahub.backend.enums.FlashSaleStatus;
import com.mangahub.backend.exception.AppException;
import com.mangahub.backend.exception.ErrorCode;
import com.mangahub.backend.mapper.FlashSaleMapper;
import com.mangahub.backend.model.FlashSale;
import com.mangahub.backend.model.FlashSaleItem;
import com.mangahub.backend.model.Manga;
import com.mangahub.backend.model.User;
import com.mangahub.backend.repository.CartItemRepository;
import com.mangahub.backend.repository.FlashSaleRepository;
import com.mangahub.backend.repository.MangaRepository;
import com.mangahub.backend.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service 
@RequiredArgsConstructor 
@FieldDefaults (level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class FlashSaleService {
    
    UserRepository userRepository;
    FlashSaleRepository flashSaleRepository;
    FlashSaleMapper mapper;
    MangaRepository mangaRepository;
    CartItemRepository cartItemRepository;

    public List<FlashSaleResponse> getAll() {

        List<FlashSale> flashSales = flashSaleRepository.findAllByOrderByStartDateDesc();
        return mapper.toFlashSaleResponses(flashSales);
    }

    public List<FlashSaleResponse> getActive() {

        List<FlashSale> activeFlashSales = flashSaleRepository.findActiveOn(LocalDate.now());
        return mapper.toFlashSaleResponses(activeFlashSales);
    }

    public FlashSaleResponse getById(Long id) {
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

        // save flashsale
        flashSaleRepository.save(flashSale);

        FlashSaleResponse response = mapper.toFlashSaleResponse(flashSale);
        response.setStatus(flashSale.getStatus());
        return response;
    }

    @Transactional 
    public FlashSaleResponse cancelFlashSale(Long id) {
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

    @Transactional 
    public FlashSaleResponse editFlashSale(Long flashSaleId, UpdateFlashSaleRequest request) {
        FlashSale flashSale = flashSaleRepository.findById(flashSaleId)
            .orElseThrow(() -> new AppException(ErrorCode.FLASH_SALE_NOT_FOUND));

        LocalDate today = LocalDate.now();

        if (flashSale.getStatus() == FlashSaleStatus.CANCELLED || today.isAfter(flashSale.getEndDate())) {
        throw new AppException(ErrorCode.FLASH_SALE_ALREADY_ENDED);
        }

        LocalDate startDate = request.getStartDate() != null ? request.getStartDate() : flashSale.getStartDate();
        LocalDate endDate = request.getEndDate() != null ? request.getEndDate() : flashSale.getEndDate();

        if (startDate == null || endDate == null || endDate.isBefore(startDate) || endDate.isBefore(today)) {
            throw new AppException(ErrorCode.INVALID_FLASH_SALE_DATES);
        }


        if (request.getName() != null && !request.getName().isBlank()) {
            String trimmedName = request.getName().trim();
            if (!flashSale.getName().equalsIgnoreCase(trimmedName)
                    && flashSaleRepository.existsByNameIgnoreCase(trimmedName)) {
                throw new AppException(ErrorCode.FLASH_SALE_ALREADY_EXISTS);
            }
            flashSale.setName(trimmedName);
        }

        flashSale.setStartDate(startDate);
        flashSale.setEndDate(endDate);
        flashSale.setStatus(resolveStatus(startDate, endDate));

        FlashSale saved = flashSaleRepository.saveAndFlush(flashSale);

        return mapper.toFlashSaleResponse(saved);
    }


    // update price or quantity
    @Transactional 
    public FlashSaleResponse editFlashSaleItem(Long flashSaleId, Long itemId, UpdateFlashSaleItemRequest request) {
        FlashSale flashSale = flashSaleRepository.findById(flashSaleId)
        .orElseThrow(() -> new AppException(ErrorCode.FLASH_SALE_NOT_FOUND));

        // safety check for flash sale status
        if (flashSale.getStatus() == FlashSaleStatus.CANCELLED || LocalDate.now().isAfter(flashSale.getEndDate())) {
            throw new AppException(ErrorCode.FLASH_SALE_ALREADY_ENDED);
        }

        // check if item exists
        FlashSaleItem item = flashSale.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.FLASH_SALE_ITEM_NOT_FOUND));

        if(request.getDiscountedPrice() != null) {
            if(request.getDiscountedPrice().compareTo(item.getManga().getBasePrice()) >= 0) {
                throw new AppException(ErrorCode.INVALID_DISCOUNTED_PRICE);
            }

            item.setDiscountedPrice(request.getDiscountedPrice());
        }

        if(request.getStockQuantity() != null) {
            if(request.getStockQuantity() < 0) {
                throw new AppException(ErrorCode.INVALID_INPUT);
            }

            item.setStockQuantity(request.getStockQuantity());
        }

        FlashSale saved = flashSaleRepository.saveAndFlush(flashSale);
        return mapper.toFlashSaleResponse(saved);
    }

    @Transactional 
    public FlashSaleResponse addFlashSaleItem(Long flashSaleId, List<AddFlashSaleItemRequest> items) {
        FlashSale flashSale = flashSaleRepository.findById(flashSaleId)
        .orElseThrow(() -> new AppException(ErrorCode.FLASH_SALE_NOT_FOUND));

        // check if flash sale has alr ended or alr been cancelled
        boolean ended = LocalDate.now().isAfter(flashSale.getEndDate());
        if(ended || flashSale.getStatus() == FlashSaleStatus.CANCELLED) {
            throw new AppException(ErrorCode.FLASH_SALE_ALREADY_ENDED);
        }
        
        
        if(items == null || items.isEmpty()) {
            throw new AppException(ErrorCode.FLASH_SALE_NOT_FOUND);
        }

        Set<Long> mangaIds = new HashSet<>();
        for(AddFlashSaleItemRequest item : items) {
            // add() returns false if there is a duplicate
            if(!mangaIds.add(item.getMangaId())) {
                throw new AppException(ErrorCode.DUPLICATE_FLASH_SALE_ITEM);
            }
        }
  
        // get and map out mangas with their id
        Map<Long, Manga> mangaById = mangaRepository.findAllById(mangaIds)
                            .stream().collect(Collectors.toMap(manga -> manga.getId(), Function.identity()));

        // check if any manga is missing from the items
        if(mangaById.size() != mangaIds.size()) {
            throw new AppException(ErrorCode.MANGA_NOT_FOUND);
        }

        // add mangas
        for(AddFlashSaleItemRequest item : items) {
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

        flashSaleRepository.save(flashSale);

        
        return mapper.toFlashSaleResponse(flashSale);
    }

    @Transactional 
    public FlashSaleResponse removeFlashSaleItem(Long flashSaleId, Long itemId) {
        FlashSale flashSale = flashSaleRepository.findById(flashSaleId)
            .orElseThrow(() -> new AppException(ErrorCode.FLASH_SALE_NOT_FOUND));

        if (flashSale.getStatus() == FlashSaleStatus.CANCELLED || LocalDate.now().isAfter(flashSale.getEndDate())) {
            throw new AppException(ErrorCode.FLASH_SALE_ALREADY_ENDED);
        }

        FlashSaleItem item = flashSale.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.FLASH_SALE_ITEM_NOT_FOUND));

        // orphanRemoval = true on FlashSale.items will delete the item row on save/flush
        flashSale.getItems().remove(item);

        FlashSale saved = flashSaleRepository.saveAndFlush(flashSale);
        return mapper.toFlashSaleResponse(saved);
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

    private void addItems(FlashSale flashSale, List<AddFlashSaleItemRequest> items) {
        if(items == null || items.isEmpty()) {
            return;
        }

        // check for manga duplicates
        Set<Long> mangaIds = new HashSet<>();
        for(AddFlashSaleItemRequest item : items) {
            // add() returns false if there is a duplicate
            if(!mangaIds.add(item.getMangaId())) {
                throw new AppException(ErrorCode.DUPLICATE_FLASH_SALE_ITEM);
            }
        }

        // get and map out mangas with their id
        Map<Long, Manga> mangaById = mangaRepository.findAllById(mangaIds)
                            .stream().collect(Collectors.toMap(manga -> manga.getId(), Function.identity()));

        // check if any manga is missing from the items
        if(mangaById.size() != mangaIds.size()) {
            throw new AppException(ErrorCode.MANGA_NOT_FOUND);
        }

        // add mangas
        for(AddFlashSaleItemRequest item : items) {
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
