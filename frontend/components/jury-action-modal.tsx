'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface JuryActionModalProps {
  isJuryMember: boolean
  onConfirmAction: () => void
}

export function JuryActionModal({ isJuryMember, onConfirmAction }: JuryActionModalProps) {
  const [open, setOpen] = useState(false)

  const handleConfirm = () => {
    onConfirmAction()
    setOpen(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            isJuryMember
              ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          {isJuryMember ? 'Withdraw Stake' : 'Apply for Jury'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isJuryMember ? 'Withdraw Jury Stake' : 'Apply for Jury'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isJuryMember ? (
              <>
                Are you sure you want to withdraw your jury stake? This will remove you from the jury pool and you will no longer be able to vote on cases until you stake again.
              </>
            ) : (
              <>
                To become a juror, you need to stake <strong>0.1 ETH</strong>. This stake ensures your commitment to fair and honest voting. Your stake can be withdrawn at any time.
                <br /><br />
                Are you sure you want to proceed?
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            className="bg-newPurple-600 hover:bg-newPurple-700 text-white"
          >
            {isJuryMember ? 'Withdraw Stake' : 'Stake 0.1 ETH'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 