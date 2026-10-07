import PageTitle from '../components/PageTitle.jsx'
import Button from '../components/Button.jsx'

export default function NotFound() {
  return (
    <>
      <PageTitle variant="soldout">Page not found</PageTitle>
      <div className="page" style={{ padding: 'var(--s6) var(--gutter)' }}>
        <Button to="/">Back to catalog</Button>
      </div>
    </>
  )
}
