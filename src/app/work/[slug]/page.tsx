import { notFound } from "next/navigation";
import projects from "@/components/sites/mutoscope/work/projects.json";
import { Gallery } from "@/components/sites/mutoscope/work/Gallery";
export const dynamicParams = false;
export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return { title: projects.find((p) => p.slug === slug)?.title };
}
export default async function Project({ params }: Props) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();
  return <Gallery project={project} />;
}
