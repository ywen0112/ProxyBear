"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { FileText, AlertCircle, CheckCircle2 } from "lucide-react"

interface InvoiceState {
  type: "empty" | "error" | "success"
  message: string
}

export default function InvoicePage() {
  // For now hardcoded, but in future this can come from API
  const state: InvoiceState = {
    type: "empty",
    message: "未购买",
  }

  const renderIcon = () => {
    switch (state.type) {
      case "error":
        return <AlertCircle className="w-16 h-16 text-red-500" />
      case "success":
        return <CheckCircle2 className="w-16 h-16 text-green-500" />
      default:
        return <FileText className="w-16 h-16 text-muted-foreground" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Header */}
          <div>
            <h1 className="text-xl font-semibold">您的发票</h1>
            <p className="text-muted-foreground">所有发票的详细清单</p>
          </div>

          {/* State Block */}
          <div className="flex flex-col items-center justify-center py-20">
            <div className="rounded-full bg-muted p-6">{renderIcon()}</div>
            <p className="mt-6 text-muted-foreground">{state.message}</p>
            {state.type === "empty" && (
              <Button asChild className="mt-4">
                <a href="/products">购买计划</a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
