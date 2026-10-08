import { Component } from 'react'
import PageTitle from './PageTitle.jsx'
import Notice from './Notice.jsx'
import Button from './Button.jsx'

export default class ErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <>
        <PageTitle variant="soldout">Something went wrong</PageTitle>
        <main className="page">
          <Notice
            tone="error"
            title="This page failed to load"
            action={<Button onClick={() => window.location.assign('/')}>Back to catalog</Button>}
          />
        </main>
      </>
    )
  }
}
