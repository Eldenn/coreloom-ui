import type { Meta, StoryObj } from '@storybook/react-vite'
import { AlertTriangleIcon, CopyIcon, ExternalLinkIcon, RocketIcon } from 'lucide-react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Field, FieldLabel } from '@/components/ui/field'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { toast } from '@/components/ui/sonner'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const meta = {
  title: 'Components/Overlays',
  component: Dialog,
  tags: ['autodocs'],
} satisfies Meta<typeof Dialog>
export default meta
type Story = StoryObj<typeof meta>

export const DialogStory: Story = {
  name: 'Dialog',
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Publish package</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Publish @coreloom/ui 2.5.0?</DialogTitle>
          <DialogDescription>
            This pushes the build to the npm registry. Versions can’t be reused.
          </DialogDescription>
        </DialogHeader>
        <Field>
          <FieldLabel htmlFor="tag">Dist tag</FieldLabel>
          <Input id="tag" defaultValue="latest" />
        </Field>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={() => toast.success('Published 2.5.0')}>Publish</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

export const AlertDialogStory: Story = {
  name: 'AlertDialog',
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete project</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <AlertTriangleIcon />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete coreloom-web?</AlertDialogTitle>
          <AlertDialogDescription>
            Its deployments, domains and environment variables go with it. This can’t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Delete project</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
}

export const SheetStory: Story = {
  name: 'Sheet',
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary">Open filters</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>Narrow the deployments list.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
}

export const DrawerStory: Story = {
  name: 'Drawer',
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="secondary">Rename project</Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-[420px]">
          <DrawerHeader>
            <DrawerTitle>Rename project</DrawerTitle>
            <DrawerDescription>The new name shows in URLs.</DrawerDescription>
          </DrawerHeader>
          <div className="px-[22px]">
            <Input defaultValue="coreloom-web" aria-label="Name" />
          </div>
          <DrawerFooter>
            <Button>Save</Button>
            <DrawerClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  ),
}

export const PopoverStory: Story = {
  name: 'Popover & HoverCard',
  render: () => (
    <div className="flex items-center gap-6">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Share</Button>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverHeader>
            <PopoverTitle>Share preview</PopoverTitle>
            <PopoverDescription>Anyone with the link can view it.</PopoverDescription>
          </PopoverHeader>
          <Input
            className="mt-3"
            readOnly
            defaultValue="https://coreloom.dev/p/8f2k"
            aria-label="Link"
          />
        </PopoverContent>
      </Popover>
      <HoverCard>
        <HoverCardTrigger asChild>
          <a href="#" className="text-primary-text">
            @matthieu
          </a>
        </HoverCardTrigger>
        <HoverCardContent>
          <div className="flex gap-3">
            <Avatar size="lg">
              <AvatarFallback>MC</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-foreground">Matthieu C.</div>
              <div className="text-[13px]">Maintains @coreloom/ui</div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  ),
}

export const Menus: Story = {
  name: 'DropdownMenu & ContextMenu',
  render: () => (
    <div className="flex items-start gap-6">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary">Actions</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>coreloom-web</DropdownMenuLabel>
          <DropdownMenuItem>
            <ExternalLinkIcon />
            Visit<DropdownMenuShortcut>⌘O</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <RocketIcon />
            Redeploy
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Delete project</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ContextMenu>
        <ContextMenuTrigger className="flex h-32 w-64 items-center justify-center rounded-md border border-dashed border-border text-[13px] text-muted-foreground">
          Right-click here
        </ContextMenuTrigger>
        <ContextMenuContent className="w-52">
          <ContextMenuItem>
            <CopyIcon />
            Copy URL<ContextMenuShortcut>⌘C</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  ),
}

export const TooltipAndToast: Story = {
  name: 'Tooltip & Toaster',
  render: () => (
    <div className="flex items-center gap-3">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Copy">
            <CopyIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Copy</TooltipContent>
      </Tooltip>
      <Button
        variant="secondary"
        onClick={() =>
          toast.success('Deployed to production', { description: 'coreloom-web · 38s' })
        }
      >
        Show a toast
      </Button>
      <Button
        variant="secondary"
        onClick={() => toast.error('Build failed', { description: 'Type error in src/theme.ts' })}
      >
        Error toast
      </Button>
    </div>
  ),
}
