import { Link } from 'react-router-dom'

export function NotFoundPanel({ what }: { what: string }) {
  return (
    <div className="page">
      <div className="empty-state">
        <p className="hero-kicker">NOT FOUND</p>
        <h1>That {what} isn’t here.</h1>
        <p className="muted-copy">
          It may have been removed, or the link may be wrong.
        </p>
        <Link className="button button-primary" to="/trips">Back to your trips</Link>
      </div>
    </div>
  )
}
