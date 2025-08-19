"use client"
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const ProvdistMap = dynamic(() => import('@/components/map/provdist-map'), { ssr: false })

export default function Page() {
	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Rice Yield by Province/District</CardTitle>
				</CardHeader>
				<CardContent>
					<ProvdistMap />
				</CardContent>
			</Card>
		</div>
	)
}


