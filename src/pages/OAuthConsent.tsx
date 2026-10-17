import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { supabase } from './supabaseClient'

export function OAuthConsent() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const authorizationId = searchParams.get('authorization_id')

  const [authDetails, setAuthDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadAuthDetails() {
      if (!authorizationId) {
        setError('Missing authorization_id')
        setLoading(false)
        return
      }

      // Check if user is authenticated
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        navigate(`/login?redirect=/oauth/consent?authorization_id=${authorizationId}`)
        return
      }

      // Get authorization details using the authorization_id
      const { data, error } = await supabase.auth.oauth.getAuthorizationDetails(authorizationId)

      if (error) {
        setError(error.message)
      } else {
        setAuthDetails(data)
      }

      setLoading(false)
    }

    loadAuthDetails()
  }, [authorizationId, navigate])

  async function handleApprove() {
    if (!authorizationId) return

    const { data, error } = await supabase.auth.oauth.approveAuthorization(authorizationId)

    if (error) {
      setError(error.message)
    } else {
      // Redirect to client app
      window.location.href = data.redirect_url
    }
  }

  async function handleDeny() {
    if (!authorizationId) return

    const { data, error } = await supabase.auth.oauth.denyAuthorization(authorizationId)

    if (error) {
      setError(error.message)
    } else {
      // Redirect to client app with error
      window.location.href = data.redirect_url
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!authDetails) return <div>No authorization request found</div>

  return (
    <div>
      <h1>Authorize {authDetails.client.name}</h1>
      <p>This application wants to access your account.</p>

      <div>
        <p>
          <strong>Client:</strong> {authDetails.client.name}
        </p>
        <p>
          <strong>Redirect URI:</strong> {authDetails.redirect_uri}
        </p>
        {authDetails.scope && authDetails.scope.trim() && (
          <div>
            <strong>Requested permissions:</strong>
            <ul>
              {authDetails.scope.split(' ').map((scopeItem) => (
                <li key={scopeItem}>{scopeItem}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div>
        <button onClick={handleApprove}>Approve</button>
        <button onClick={handleDeny}>Deny</button>
      </div>
    </div>
  )
}
