import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Tool1Page() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Tenant Verification</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <Card className="aspect-video">
            <CardHeader>
              <CardTitle>Feature A</CardTitle>
              <CardDescription>Description for feature A</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Content for feature A goes here.</p>
            </CardContent>
          </Card>
          <Card className="aspect-video">
            <CardHeader>
              <CardTitle>Feature B</CardTitle>
              <CardDescription>Description for feature B</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Content for feature B goes here.</p>
            </CardContent>
          </Card>
          <Card className="aspect-video">
            <CardHeader>
              <CardTitle>Feature C</CardTitle>
              <CardDescription>Description for feature C</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Content for feature C goes here.</p>
            </CardContent>
          </Card>
        </div>
        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-4">
          <h2 className="text-2xl font-bold mb-4">Tool 1 Dashboard</h2>
          <p className="text-muted-foreground">
            This is the main content area for Tool 1. Add your tool-specific components and functionality here.
          </p>
        </div>
      </div>
    </>
  )
}
