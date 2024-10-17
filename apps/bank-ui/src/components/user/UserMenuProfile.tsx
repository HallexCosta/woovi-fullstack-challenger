import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import type { DashboardQuery$data } from '@/pages/app/__generated__/DashboardQuery.graphql'
import { Icon } from '@iconify/react/dist/iconify.js'
import { useCookies } from 'react-cookie'
import { graphql, useFragment } from 'react-relay'
import { useNavigate } from 'react-router-dom'
import type { UserMenuProfile_query$key } from './__generated__/UserMenuProfile_query.graphql'

type UserMenuProfileProps = {
  dashboardQuery: DashboardQuery$data
}

export const UserMenuProfile = (props: UserMenuProfileProps) => {
  const navigate = useNavigate()
  const [cookies, setCookie, removeCookie] = useCookies()

  const account = useFragment<UserMenuProfile_query$key>(
    graphql`
      fragment UserMenuProfile_query on Query 
      @argumentDefinitions(accountPublicId: { type: Int }) {
        accountByPublicId(publicId: $accountPublicId) {
          node {
            balance
            publicId
            user {
              profileImage
            }
          }
        }
      }  
    `,
    props.dashboardQuery
  )

  console.log({ account })

  const onLogout = () => {
    removeCookie('token')
    navigate('/')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className="flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
          <AvatarImage
            className="w-10 h-10"
            src={
              account?.accountByPublicId?.node?.user?.profileImage ?? undefined
            }
            alt="hallexcosta"
          />
          <AvatarFallback className="bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900 outline-none">
            <Icon width={24} height={24} icon="icon-park-outline:people" />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="mr-4 md:mr-8">
        <DropdownMenuLabel>
          My account: {account?.accountByPublicId?.node?.publicId}
        </DropdownMenuLabel>
        <Separator />
        <DropdownMenuItem className="gap-2">
          <Icon icon="mdi:person" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2">
          <Icon width={16} height={16} icon="mdi:bell" />
          Notifications
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2">
          <Icon width={16} height={16} icon="mdi:scheduled-payment" />
          Scheduled payment
        </DropdownMenuItem>
        <Separator />
        <DropdownMenuItem className="gap-2">
          <Icon width={16} height={16} icon="ic:baseline-people" />
          Team
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2">
          <Icon width={16} height={16} icon="mingcute:user-add-fill" />
          Invite users
        </DropdownMenuItem>
        <Separator />
        <DropdownMenuItem className="gap-2">
          <Icon icon="mdi:settings" />
          Settings
        </DropdownMenuItem>
        <Separator />
        <DropdownMenuItem onClick={onLogout} className="gap-2">
          <Icon icon="mingcute:exit-fill" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
