import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-balance mb-6">联系我们</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              对我们的代理解决方案有疑问？我们的团队随时为您提供帮助，找到最适合您需求的设置。
            </p>
            <div className="mt-8">
              <Button size="lg" className="text-lg px-8 py-6 bg-accent hover:bg-accent/90" asChild>
                <Link href="/register">立即注册</Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>发送消息</CardTitle>
                <CardDescription>填写以下表单，我们将在24小时内回复您。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">名字</Label>
                    <Input id="firstName" placeholder="请输入名字" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">姓氏</Label>
                    <Input id="lastName" placeholder="请输入姓氏" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱</Label>
                  <Input id="email" type="email" placeholder="请输入邮箱" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">公司</Label>
                  <Input id="company" placeholder="请输入公司名称" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">消息</Label>
                  <Textarea id="message" placeholder="告诉我们您的代理需求..." className="min-h-[120px]" />
                </div>
                <Button className="w-full" size="lg">
                  发送消息
                </Button>
              </CardContent>
            </Card>
            {/* Contact Information */}
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>联系信息</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-1">邮箱</h4>
                    <p className="text-muted-foreground">support@proxybear.com</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">销售</h4>
                    <p className="text-muted-foreground">sales@proxybear.com</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">支持时间</h4>
                    <p className="text-muted-foreground">企业客户7×24小时支持</p>
                    <p className="text-muted-foreground">其他计划：美国东部时间上午9点至下午6点</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>常见问题</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">我可以多快开始使用？</h4>
                    <p className="text-sm text-muted-foreground">
                      大多数账户在注册后几分钟内即可激活。企业设置可能需要24-48小时。
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-2">你们提供定制解决方案吗？</h4>
                    <p className="text-sm text-muted-foreground">
                      是的！我们与企业合作，创建满足特定需求的定制代理解决方案。
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-2">你们接受哪些支付方式？</h4>
                    <p className="text-sm text-muted-foreground">
                      我们接受所有主要信用卡、PayPal以及企业账户的电汇。
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}