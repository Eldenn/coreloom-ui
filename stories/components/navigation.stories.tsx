import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  BlocksIcon,
  BookOpenIcon,
  HomeIcon,
  MoonIcon,
  RocketIcon,
  SettingsIcon,
} from 'lucide-react'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from '@/components/ui/menubar'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const meta = { title: 'Components/Navigation', component: Tabs, tags: ['autodocs'] } satisfies Meta<
  typeof Tabs
>
export default meta
type Story = StoryObj<typeof meta>

export const TabsStory: Story = {
  name: 'Tabs',
  render: () => (
    <div className="flex flex-col gap-8">
      <Tabs defaultValue="overview" className="max-w-md">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">Usage and recent activity.</TabsContent>
        <TabsContent value="deployments">Every build, newest first.</TabsContent>
        <TabsContent value="settings">Project configuration.</TabsContent>
      </Tabs>
      <Tabs defaultValue="preview" className="max-w-md">
        <TabsList variant="line">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
        </TabsList>
        <TabsContent value="preview" className="pt-3">
          The rendered component.
        </TabsContent>
        <TabsContent value="code" className="pt-3">
          Its source.
        </TabsContent>
      </Tabs>
    </div>
  ),
}

export const BreadcrumbAndPagination: Story = {
  name: 'Breadcrumb & Pagination',
  render: () => (
    <div className="flex flex-col gap-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Docs</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Components</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Button</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Pagination className="justify-start">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>
              2
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  ),
}

export const CommandStory: Story = {
  name: 'Command',
  render: () => (
    <Command className="max-w-[520px] rounded-lg border border-border shadow-xl">
      <CommandInput placeholder="Search docs, components, commands…" />
      <CommandList>
        <CommandEmpty>No components match that search.</CommandEmpty>
        <CommandGroup heading="Docs">
          <CommandItem>
            <BookOpenIcon />
            Getting started
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Components">
          <CommandItem>
            <BlocksIcon />
            Button
          </CommandItem>
          <CommandItem>
            <BlocksIcon />
            Dialog
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem>
            <MoonIcon />
            Toggle theme<CommandShortcut>⌘J</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
}

export const MenubarStory: Story = {
  name: 'Menubar & NavigationMenu',
  render: () => (
    <div className="flex flex-col gap-8">
      <Menubar className="w-fit">
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              New project<MenubarShortcut>⌘N</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Close</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              Toggle sidebar<MenubarShortcut>⌘B</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      <NavigationMenu viewport={false}>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Product</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="m-0 grid w-[400px] list-none grid-cols-2 gap-1 p-1">
                {['Components', 'Blocks', 'Theming', 'Registry'].map((t) => (
                  <li key={t}>
                    <NavigationMenuLink href="#">
                      <span className="font-medium text-foreground">{t}</span>
                      <span className="text-[13px] text-muted-foreground">
                        One line about {t.toLowerCase()}.
                      </span>
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="#" className={navigationMenuTriggerStyle()}>
              Pricing
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  ),
}

export const SidebarStory: Story = {
  name: 'Sidebar',
  parameters: { layout: 'fullscreen' },
  render: () => (
    <SidebarProvider className="min-h-[420px]">
      <Sidebar collapsible="none" className="h-[420px] border-r border-sidebar-border">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive>
                    <HomeIcon />
                    <span>Overview</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <RocketIcon />
                    <span>Deployments</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>3</SidebarMenuBadge>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <SettingsIcon />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <div className="flex-1 p-6 text-[14px] text-muted-foreground">Page content</div>
    </SidebarProvider>
  ),
}
