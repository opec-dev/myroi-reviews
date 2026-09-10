import { ClientWorkspace } from "@/components/client-workspace";

export default async function ClientPage({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params;
  return <ClientWorkspace slug={slug}/>;
}
