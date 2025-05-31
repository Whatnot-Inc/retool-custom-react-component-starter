import React from 'react';
import ForceGraphComponent from './ForceGraphComponent';
import './MyRetoolComponent.css';

/**
 * This is a custom Retool component that uses the Retool API to get the count state.
 *
 * FOR LOCAL DEVELOPMENT WITH `npm run start`:
 * 1. Comment out the next line (real Retool import)
 * 2. Uncomment the mock import line below
 *
 * FOR PRODUCTION/DEPLOYMENT TO RETOOL:
 * 1. Comment out the mock import line
 * 2. Uncomment the real Retool import line
 */

// import { Retool } from '@tryretool/custom-component-support';
import { Retool } from './mocks/retool'

interface Node {
  asset_key: string;
  domain: string;
  type: string;
  [key: string]: any;
}

interface Edge {
  source_asset_key: string;
  target_asset_key: string;
  [key: string]: any;
}

// Sample data for initial display
const sampleNodes: Node[] = [
  // E-commerce Domain
  { asset_key: "users_table", domain: "ecommerce", type: "table" },
  { asset_key: "orders_table", domain: "ecommerce", type: "table" },
  { asset_key: "products_table", domain: "ecommerce", type: "table" },
  { asset_key: "user_service", domain: "ecommerce", type: "service" },
  { asset_key: "order_service", domain: "ecommerce", type: "service" },
  { asset_key: "product_service", domain: "ecommerce", type: "service" },
  { asset_key: "user_api", domain: "ecommerce", type: "endpoint" },
  { asset_key: "order_api", domain: "ecommerce", type: "endpoint" },
  { asset_key: "product_api", domain: "ecommerce", type: "endpoint" },
  { asset_key: "ecommerce_frontend", domain: "ecommerce", type: "application" },

  // Analytics Domain
  { asset_key: "analytics_db", domain: "analytics", type: "table" },
  { asset_key: "metrics_table", domain: "analytics", type: "table" },
  { asset_key: "analytics_service", domain: "analytics", type: "service" },
  { asset_key: "metrics_service", domain: "analytics", type: "service" },
  { asset_key: "analytics_api", domain: "analytics", type: "endpoint" },
  { asset_key: "metrics_api", domain: "analytics", type: "endpoint" },
  { asset_key: "analytics_dashboard", domain: "analytics", type: "application" }
];

const sampleEdges: Edge[] = [
  // E-commerce Domain Internal Connections
  { source_asset_key: "ecommerce_frontend", target_asset_key: "user_api" },
  { source_asset_key: "ecommerce_frontend", target_asset_key: "order_api" },
  { source_asset_key: "ecommerce_frontend", target_asset_key: "product_api" },
  { source_asset_key: "user_api", target_asset_key: "user_service" },
  { source_asset_key: "order_api", target_asset_key: "order_service" },
  { source_asset_key: "product_api", target_asset_key: "product_service" },
  { source_asset_key: "user_service", target_asset_key: "users_table" },
  { source_asset_key: "order_service", target_asset_key: "orders_table" },
  { source_asset_key: "product_service", target_asset_key: "products_table" },
  { source_asset_key: "order_service", target_asset_key: "users_table" },
  { source_asset_key: "order_service", target_asset_key: "products_table" },

  // Analytics Domain Internal Connections
  { source_asset_key: "analytics_dashboard", target_asset_key: "analytics_api" },
  { source_asset_key: "analytics_dashboard", target_asset_key: "metrics_api" },
  { source_asset_key: "analytics_api", target_asset_key: "analytics_service" },
  { source_asset_key: "metrics_api", target_asset_key: "metrics_service" },
  { source_asset_key: "analytics_service", target_asset_key: "analytics_db" },
  { source_asset_key: "metrics_service", target_asset_key: "metrics_table" },

  // Cross-Domain Connections
  { source_asset_key: "order_service", target_asset_key: "analytics_service" },
  { source_asset_key: "product_service", target_asset_key: "metrics_service" },
  { source_asset_key: "analytics_service", target_asset_key: "users_table" },
  { source_asset_key: "metrics_service", target_asset_key: "products_table" }
];

const MyRetoolComponent = () => {
  const [nodesState] = Retool.useStateArray({
    name: 'nodes',
    initialValue: sampleNodes
  }) || [sampleNodes];

  const [edgesState] = Retool.useStateArray({
    name: 'edges',
    initialValue: sampleEdges
  }) || [sampleEdges];

  // Type assertion to convert the SerializableArray to our specific types
  const nodes = nodesState as unknown as Node[];
  const edges = edgesState as unknown as Edge[];

  return (
    <div className="my-retool-component my-retool-component-container">
      <h1 className="my-retool-component-title">Force Graph Visualization</h1>
      <div className="graph-container">
        <ForceGraphComponent nodes={nodes} edges={edges} />
      </div>
    </div>
  );
};

export default MyRetoolComponent;
