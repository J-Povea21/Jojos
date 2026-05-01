import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="mx-auto max-w-2xl px-4 py-16 text-center">
          <p className="text-5xl mb-4" aria-hidden="true">⚠️</p>
          <h1 className="text-2xl font-extrabold text-jojo-magenta mb-2">Something went wrong</h1>
          <p className="text-sm text-gray-600 mb-6">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-5 py-2 rounded-full bg-jojo-pink text-white font-bold hover:bg-jojo-magenta transition-colors"
          >
            Try again
          </button>
        </section>
      )
    }
    return this.props.children
  }
}
