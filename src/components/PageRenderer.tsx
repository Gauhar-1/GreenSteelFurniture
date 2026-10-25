import type { PageBlock } from "@/types/blocks";
import { HeroRoomShowcase } from "@/components/blocks/HeroRoomShowcase";
import { AsymmetricSpacesBento } from "@/components/blocks/AsymmetricSpacesBento";
import { InteractiveRoomLookbook } from "@/components/blocks/InteractiveRoomLookbook";
import { VisualCraftsmanshipSplit } from "@/components/blocks/VisualCraftsmanshipSplit";
import { WallColorMatcher } from "@/components/blocks/WallColorMatcher";
import { HeroBlock } from "@/components/blocks/HeroBlock";
import { CategoryGridBlock } from "@/components/blocks/CategoryGridBlock";
import { ShowroomEmptyState } from "@/components/ShowroomEmptyState";

interface PageRendererProps {
  blocks: PageBlock[];
}

/**
 * PageRenderer — Server Component
 * 
 * Dynamically resolves and renders showroom blocks based on their discriminated union `type`.
 * Follows the Open/Closed Principle (OCP).
 */
export function PageRenderer({ blocks }: PageRendererProps) {
  if (!blocks || blocks.length === 0) {
    return <ShowroomEmptyState />;
  }

  return (
    <div className="flex flex-col w-full bg-[#FAF8F5]">
      {blocks.map((block) => {
        switch (block.type) {
          case "hero_room_showcase":
            return <HeroRoomShowcase key={block.id} data={block} />;

          case "asymmetric_spaces_bento":
            return <AsymmetricSpacesBento key={block.id} data={block} />;

          case "wall_color_matcher":
            return <WallColorMatcher key={block.id} data={block} />;

          case "interactive_room_lookbook":
            return <InteractiveRoomLookbook key={block.id} data={block} />;

          case "visual_craftsmanship_split":
            return <VisualCraftsmanshipSplit key={block.id} data={block} />;

          case "hero":
            return <HeroBlock key={block.id} data={block} />;

          case "category_grid":
            return <CategoryGridBlock key={block.id} data={block} />;

          default: {
            // TypeScript exhaustiveness guarantee
            const _exhaustiveCheck: never = block;
            console.warn(`[PageRenderer] Encountered unhandled block:`, _exhaustiveCheck);
            return null;
          }
        }
      })}
    </div>
  );
}
