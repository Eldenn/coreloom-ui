import type { Meta, StoryObj } from "@storybook/react-vite"
import { Icon } from "@/components/ui/icon"

import { AuthLayout } from "@/components/auth-layout"
import { LoginForm } from "@/components/login-form"
import { SignupForm } from "@/components/signup-form"
import { VerifyForm } from "@/components/verify-form"

const brand = <span className="font-display text-[20px] font-bold tracking-[-0.03em] text-foreground">Core<span className="text-primary-text">loom</span></span>

const meta = {
  title: "Blocks/Auth",
  component: LoginForm,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: { onSubmit: () => {}, signUpHref: "#", providers: [{ id: "github", label: "Continue with GitHub", icon: <Icon name="github" /> }] },
  argTypes: { pending: { control: "boolean" }, error: { control: "text" } },
} satisfies Meta<typeof LoginForm>
export default meta
type Story = StoryObj<typeof meta>

export const SignIn: Story = {
  render: (args) => <AuthLayout brand={brand} footer={<>By continuing you agree to the <a href="#">Terms</a>.</>}><LoginForm {...args} /></AuthLayout>,
}

export const SignInError: Story = {
  args: { error: "Wrong email or password." },
  render: (args) => <AuthLayout brand={brand}><LoginForm {...args} /></AuthLayout>,
}

export const SignUp: Story = {
  render: () => <AuthLayout brand={brand}><SignupForm onSubmit={() => {}} signInHref="#" terms={<>By creating an account you agree to the <a href="#">Terms</a>.</>} /></AuthLayout>,
}

export const VerifyCode: Story = {
  render: () => <AuthLayout brand={brand}><VerifyForm onSubmit={() => {}} onResend={() => {}} destination="m•••@coreloom.dev" /></AuthLayout>,
}
