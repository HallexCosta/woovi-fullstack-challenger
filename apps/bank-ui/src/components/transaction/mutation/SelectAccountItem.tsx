import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { SelectItem } from '@/components/ui/select'
import { graphql, useFragment } from 'react-relay'
import type { SelectAccountItem_accounts$key } from './__generated__/SelectAccountItem_accounts.graphql'

type SelectAccountItem = {
  listAccountFragment: SelectAccountItem_accounts$key | null
}

export const SelectAccountItem = ({
  listAccountFragment
}: SelectAccountItem) => {
  const selectAccountItem = useFragment<SelectAccountItem_accounts$key>(
    graphql`
    fragment SelectAccountItem_accounts on Account {
      publicId
      user {
        profileImage
        pixKey
      }
    }  
  `,
    listAccountFragment
  )

  return (
    <SelectItem
      className="py-2"
      value={String(selectAccountItem?.publicId) ?? '0'}
    >
      <div className="flex flex-row items-center justify-start gap-2">
        <Avatar>
          <AvatarImage
            width={40}
            height={40}
            src={selectAccountItem?.user?.profileImage ?? undefined}
          />
        </Avatar>
        <div className="flex flex-col items-start">
          <span className="flex gap-2">
            <strong>Account Id:</strong>
            {selectAccountItem?.publicId}
          </span>
          <span className="flex gap-2">
            <strong>PIX Key:</strong>
            {selectAccountItem?.user?.pixKey}
          </span>
        </div>
      </div>
    </SelectItem>
  )
}
