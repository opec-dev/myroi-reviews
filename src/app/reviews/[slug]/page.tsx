import { ReviewWall } from "@/components/review-wall";
export default async function ReviewWallPage({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<{preview?:string}>}){const[{slug},query]=await Promise.all([params,searchParams]);return <ReviewWall slug={slug} preview={query.preview==="1"}/>}
