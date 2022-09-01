import type { GetStaticProps, NextPage } from "next";
import { Client } from "@notionhq/client";
import NotionBlocks, { BlockType } from "notion-block-renderer";

const notion = new Client({ auth: process.env.NOTION_KEY as string });
const databaseId = process.env.NOTION_DATABASE_ID as string;

export const getStaticProps: GetStaticProps = async () => {
  const { results } = await notion.databases.query({
    database_id: databaseId,
  });
  const page = results[0];
  const pageId = page.id;

  const data = [];
  let cursor = undefined;
  while (true) {
    const { results, next_cursor }: any = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
    });
    data.push(...results);
    if (!next_cursor) break;
    cursor = next_cursor;
  }
  return {
    props: {
      blocks: data,
    },
    revalidate: 10,
  };
};

const Home: NextPage<{
  blocks: BlockType[];
}> = ({ blocks }) => {
  return (
    <div className="relative overflow-hidden">
      <div className="flex flex-col items-center max-w-2xl w-full mx-auto">
        <main>
          <NotionBlocks blocks={blocks} isCodeHighlighter={true} />
        </main>
      </div>
    </div>
  );
};

export default Home;
