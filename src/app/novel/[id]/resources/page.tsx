"use client";

import { useState } from "react";
import { PageLayout } from "@/components/ui/page-layout";
import { SlidingDrawer } from "@/components/ui/drawer";
import { SimpleTabs } from "@/components/ui/tabs";
import { ConfigEntity } from "@/lib/configs/config-registry";
import { useDrawerStore } from "@/stores/useDrawerStore";
import { Users, Building2, MapPin } from "lucide-react";
import { CharacterPanel } from "./components/CharacterPanel";
import { OrganizationPanel } from "./components/OrganizationPanel";
import { LocationPanel } from "./components/LocationPanel";

const TABS = [
  { key: ConfigEntity.CHARACTER, label: "人物", icon: <Users className="h-3.5 w-3.5" /> },
  { key: ConfigEntity.ORGANIZATION, label: "组织", icon: <Building2 className="h-3.5 w-3.5" /> },
  { key: ConfigEntity.LOCATION, label: "地点", icon: <MapPin className="h-3.5 w-3.5" /> },
];

const PANELS: Record<string, React.FC> = {
  [ConfigEntity.CHARACTER]: CharacterPanel,
  [ConfigEntity.ORGANIZATION]: OrganizationPanel,
  [ConfigEntity.LOCATION]: LocationPanel,
};

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState(ConfigEntity.CHARACTER);
  const { isOpen, config } = useDrawerStore();
  const closeDrawer = useDrawerStore((s) => s.close);

  const ActivePanel = PANELS[activeTab];

  return (
    <PageLayout
      header={
        <div className="mb-4 flex items-center justify-between">
          <SimpleTabs
            tabs={TABS}
            value={activeTab}
            onChange={(key) => {
              setActiveTab(key as ConfigEntity);
              useDrawerStore.getState().close();
            }}
          />
        </div>
      }
      drawer={
        <SlidingDrawer
          open={isOpen}
          onClose={closeDrawer}
          onCreate={config?.onCreate}
          onUpdate={config?.onUpdate}
          title={config?.title}
        >
          {config?.content}
        </SlidingDrawer>
      }
    >
      <ActivePanel />
    </PageLayout>
  );
}
