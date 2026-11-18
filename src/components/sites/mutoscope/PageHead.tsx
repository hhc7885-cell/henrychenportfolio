import content from "./content.json";
export function PageHead({ page }: { page: keyof typeof content }) {
  const [title, intro] = content[page].head;
  return (
    <div className={"pageHead " + page + "Head"}>
      <h1>{title}</h1>
      <p>{intro}</p>
    </div>
  );
}
