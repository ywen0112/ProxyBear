import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const pricingPlans = [
  {
    name: "入门版",
    price: 29,
    description: "适合小型项目和测试",
    features: [
      "每月10GB带宽",
      "数据中心代理",
      "支持HTTP/HTTPS协议",
      "基础支持",
      "API访问",
    ],
    popular: false,
  },
  {
    name: "专业版",
    price: 79,
    description: "适合成长中的企业",
    features: [
      "每月100GB带宽",
      "住宅+数据中心代理",
      "支持所有协议",
      "优先支持",
      "高级API功能",
      "自定义轮换规则",
    ],
    popular: true,
  },
  {
    name: "企业版",
    price: 199,
    description: "适合大规模运营",
    features: [
      "每月500GB带宽",
      "包含所有代理类型",
      "专属客户经理",
      "7×24小时电话支持",
      "自定义集成",
      "SLA保证",
      "团队协作工具",
    ],
    popular: false,
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-balance mb-6">简单透明的定价</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              选择适合您需求的完美计划。所有计划均包含我们的核心功能，无隐藏费用或设置成本。
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative h-full ${plan.popular ? "ring-2 ring-accent scale-105" : ""}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-accent text-accent-foreground">最受欢迎</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-muted-foreground">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">${plan.price}</span>
                    <span className="text-muted-foreground">/月</span>
                  </div>
                </CardHeader>
                <CardContent className="pb-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" size="lg" variant={plan.popular ? "default" : "outline"} asChild>
                    <Link href="/register">立即开始</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          <div className="mt-16 text-center">
            <p className="text-muted-foreground mb-6">
              需要定制解决方案？我们提供针对您特定需求量身定制的企业套餐。
            </p>
            <Button variant="outline" size="lg" asChild>
              <Link href="/contact">联系销售</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}