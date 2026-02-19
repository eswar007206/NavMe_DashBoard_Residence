import { motion } from "framer-motion";
import DataTable from "@/components/dashboard/DataTable";
import type { TableConfig } from "@/lib/tableConfig";

interface TablePageProps {
  config: TableConfig;
}

export default function TablePage({ config }: TablePageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          {config.displayName}
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5">{config.description}</p>
      </motion.div>
      <DataTable config={config} />
    </motion.div>
  );
}
