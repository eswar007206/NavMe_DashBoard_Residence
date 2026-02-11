import { motion } from "framer-motion";
import DataTable from "@/components/dashboard/DataTable";
import type { TableConfig } from "@/lib/tableConfig";

interface TablePageProps {
  config: TableConfig;
}

export default function TablePage({ config }: TablePageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          {config.displayName}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">{config.description}</p>
      </div>
      <DataTable config={config} />
    </motion.div>
  );
}
