import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { PersonalityCheckCreator } from "@/components/personality-check-creator"

export default function PersonalityCheckPage() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Personality Check</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Personality Check</h1>
            <p className="text-muted-foreground">
              Create personalized video interviews for potential tenants. Set up questions and generate shareable links
              for one-way video interviews.
            </p>
          </div>
          <PersonalityCheckCreator />
        </div>
      </div>
    </>
  )
}
