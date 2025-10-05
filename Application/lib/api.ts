// API utility functions for client-side data fetching

export async function fetchSubscriptions() {
  const response = await fetch("/api/subscriptions")
  if (!response.ok) {
    throw new Error("Failed to fetch subscriptions")
  }
  return response.json()
}

export async function updateSubscriptionStatus(id: number, status: string) {
  const response = await fetch(`/api/subscriptions/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  })

  if (!response.ok) {
    throw new Error("Failed to update subscription")
  }
  return response.json()
}

export async function cancelSubscription(id: number) {
  const response = await fetch(`/api/subscriptions/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("Failed to cancel subscription")
  }
  return response.json()
}

export async function createSubscription(productId: number, plan: string) {
  const response = await fetch("/api/subscriptions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ productId, plan }),
  })

  if (!response.ok) {
    throw new Error("Failed to create subscription")
  }
  return response.json()
}

export async function fetchBillingHistory() {
  const response = await fetch("/api/billing")
  if (!response.ok) {
    throw new Error("Failed to fetch billing history")
  }
  return response.json()
}
