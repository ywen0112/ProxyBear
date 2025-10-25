"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"

export interface ProductCardProps {
  title: string
  description: string
  features: string[]
  // price: string
  // priceType: string
  // pricePerUnit: string
  productId: string
}

export function ProductCard({
  title,
  description,
  features,
  // price,
  // priceType,
  // pricePerUnit,
  productId
}: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // const handleGetStarted = async () => {
  //   setIsLoading(true)
  //   setError(null)
  //   try {
  //     router.push("/register")
  //   } catch (error) {
  //     console.error("Failed to redirect:", error)
  //     setError("Something went wrong. Please try again.")
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

  return (
    <Card className="relative h-full flex flex-col transition-all duration-300 hover:scale-105">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        <CardDescription className="text-muted-foreground leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-6 flex-grow">
        {/* <div className="mb-6">
          {priceType && (
            <span className="text-muted-foreground mr-1">{priceType}</span>
          )}
          <span className="text-3xl font-bold text-foreground">${price}</span>
          {pricePerUnit && (
            <span className="text-muted-foreground">/{pricePerUnit}</span>
          )}
        </div> */}

        <ul className="space-y-3 mt-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-3">
              <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      {/* <CardFooter className="flex flex-col items-stretch mt-auto">
        <Button
          className="w-full"
          size="lg"
          onClick={handleGetStarted}
          disabled={isLoading}
          variant="outline"
        >
          {isLoading ? "Processing..." : "Get Started"}
        </Button>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </CardFooter> */}
    </Card>
  )
}
