import React, { useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
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

interface DomainCluster {
  domain: string;
  color: string;
  nodes: Node[];
  center: { x: number; y: number };
  radius: number;
}

interface DomainColors {
  background: string;
  node: string;
}

const domainColors: Record<string, DomainColors> = {
  ecommerce: {
    background: 'rgba(78, 205, 196, 0.2)', // Teal with transparency
    node: '#4ECDC4'
  },
  analytics: {
    background: 'rgba(255, 107, 107, 0.2)', // Red with transparency
    node: '#FF6B6B'
  },
  default: {
    background: 'rgba(31, 119, 180, 0.2)', // Blue with transparency
    node: '#1f77b4'
  }
};

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

  // Force Graph Component State
  const graphRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [domainClusters, setDomainClusters] = useState<DomainCluster[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [isDomainOpen, setIsDomainOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [clusteringMode, setClusteringMode] = useState<'dag' | 'cluster'>('cluster');
  const [hasCycles, setHasCycles] = useState(false);

  // Detect cycles in the graph using DFS
  const detectCycles = (nodes: any[], links: any[]) => {
    if (!nodes || nodes.length === 0 || !links || links.length === 0) {
      return false;
    }

    try {
      const graph: Record<string, string[]> = {};
      const visited: Record<string, boolean> = {};
      const recStack: Record<string, boolean> = {};

      // Initialize all nodes
      nodes.forEach(node => {
        if (node && node.id) {
          graph[node.id] = [];
          visited[node.id] = false;
          recStack[node.id] = false;
        }
      });

      // Build adjacency list from actual data links (not domain clustering links)
      links.forEach(link => {
        if (link && !link.isDomainCluster && link.source && link.target) {
          // Handle both string IDs and object references
          const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
          const targetId = typeof link.target === 'string' ? link.target : link.target.id;
          
          if (sourceId && targetId && graph[sourceId] && graph[targetId] !== undefined) {
            graph[sourceId].push(targetId);
          }
        }
      });

      // DFS function to detect cycles
      const dfs = (nodeId: string): boolean => {
        if (!nodeId || visited[nodeId] === undefined) return false;
        
        visited[nodeId] = true;
        recStack[nodeId] = true;

        for (const neighbor of graph[nodeId] || []) {
          if (!visited[neighbor] && dfs(neighbor)) {
            return true;
          } else if (recStack[neighbor]) {
            return true;
          }
        }

        recStack[nodeId] = false;
        return false;
      };

      // Check each unvisited node
      for (const nodeId of Object.keys(graph)) {
        if (!visited[nodeId] && dfs(nodeId)) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.warn('Error during cycle detection:', error);
      // If there's an error in cycle detection, assume there are cycles to be safe
      return true;
    }
  };

  // Get unique domains and types for the filters
  const domains = [...new Set(nodes.map(node => node.domain))];
  const types = [...new Set(nodes.map(node => node.type))];

  // Transform the data for the force graph
  const filteredNodes = nodes.filter(node => {
    const domainMatch = selectedDomains.length === 0 || selectedDomains.includes(node.domain);
    const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(node.type);
    return domainMatch && typeMatch;
  });

  // Add virtual links between nodes of the same domain to encourage clustering
  const domainClusteringLinks: any[] = [];
  const domainGroups = filteredNodes.reduce((groups, node) => {
    if (!groups[node.domain]) groups[node.domain] = [];
    groups[node.domain].push(node);
    return groups;
  }, {} as Record<string, Node[]>);

  // Create weak links between nodes in the same domain
  Object.values(domainGroups).forEach(domainNodes => {
    for (let i = 0; i < domainNodes.length; i++) {
      for (let j = i + 1; j < domainNodes.length; j++) {
        domainClusteringLinks.push({
          source: domainNodes[i].asset_key,
          target: domainNodes[j].asset_key,
          isDomainCluster: true,
          value: 0.1 // Weak link strength
        });
      }
    }
  });

  const graphData = {
    nodes: filteredNodes.map(node => ({
      id: node.asset_key,
      ...node
    })),
    links: [
      ...edges
        .filter(edge => {
          const sourceNode = nodes.find(n => n.asset_key === edge.source_asset_key);
          const targetNode = nodes.find(n => n.asset_key === edge.target_asset_key);
          if (!sourceNode || !targetNode) return false;
          
          const sourceDomainMatch = selectedDomains.length === 0 || selectedDomains.includes(sourceNode.domain);
          const targetDomainMatch = selectedDomains.length === 0 || selectedDomains.includes(targetNode.domain);
          const sourceTypeMatch = selectedTypes.length === 0 || selectedTypes.includes(sourceNode.type);
          const targetTypeMatch = selectedTypes.length === 0 || selectedTypes.includes(targetNode.type);
          
          return sourceDomainMatch && targetDomainMatch && sourceTypeMatch && targetTypeMatch;
        })
        .map(edge => ({
          source: edge.source_asset_key,
          target: edge.target_asset_key,
          isDomainCluster: false,
          ...edge
        })),
      ...domainClusteringLinks
    ]
  };

  // Check for cycles immediately after creating graph data
  const currentHasCycles = detectCycles(graphData.nodes, graphData.links);
  
  // Update hasCycles state if it's different
  useEffect(() => {
    if (currentHasCycles !== hasCycles) {
      setHasCycles(currentHasCycles);
    }
  }, [currentHasCycles, hasCycles]);

  // Force cluster mode if cycles are detected
  const safeDagMode = clusteringMode === 'dag' && !currentHasCycles ? 'lr' : undefined;

  // Group nodes by domain
  useEffect(() => {
    const clusters = nodes.reduce((clusters: DomainCluster[], node) => {
      const existingCluster = clusters.find(c => c.domain === node.domain);
      if (existingCluster) {
        existingCluster.nodes.push(node);
      } else {
        clusters.push({
          domain: node.domain,
          color: getDomainColors(node.domain).background,
          nodes: [node],
          center: { x: 0, y: 0 },
          radius: 0
        });
      }
      return clusters;
    }, []);
    setDomainClusters(clusters);
  }, [nodes]);

  const getDomainColors = (domain: string): DomainColors => {
    return domainColors[domain] || domainColors.default;
  };

  const getNodeColor = (node: any) => {
    return getDomainColors(node.domain).node;
  };

  const getNodeVal = (node: any) => {
    // Nodes in the same domain get higher values to cluster together
    const domainNodeCount = nodes.filter(n => n.domain === node.domain).length;
    return Math.max(1, domainNodeCount / 10); // Scale based on domain size
  };

  const getLinkColor = (link: any) => {
    // Hide domain clustering links (make them transparent)
    if (link.isDomainCluster) return 'rgba(0,0,0,0)';
    
    const sourceNode = graphData.nodes.find(n => n.id === link.source);
    const targetNode = graphData.nodes.find(n => n.id === link.target);
    return sourceNode?.domain !== targetNode?.domain ? '#FFD93D' : '#999';
  };

  const handleNodeClick = (node: any) => {
    setSelectedNode(node);
  };

  const handleBackgroundClick = () => {
    setSelectedNode(null);
  };

  const toggleDomain = (domain: string) => {
    setSelectedDomains(prev => 
      prev.includes(domain) 
        ? prev.filter(d => d !== domain)
        : [...prev, domain]
    );
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const getSelectedText = (items: string[]) => {
    if (items.length === 0) return 'All';
    if (items.length === 1) return items[0].charAt(0).toUpperCase() + items[0].slice(1);
    return `${items.length} selected`;
  };

  return (
    <div className="my-retool-component my-retool-component-container">
      <h1 className="my-retool-component-title">Force Graph Visualization</h1>
      <div className="graph-container">
        <div ref={containerRef} className="force-graph-container">
          <div className="graph-controls">
            <div className="dropdown-filter">
              <button 
                className="dropdown-button"
                onClick={() => {
                  if (!currentHasCycles) {
                    setClusteringMode(clusteringMode === 'dag' ? 'cluster' : 'dag');
                  } else {
                    console.warn('Cannot switch to DAG mode: cycles detected in graph');
                  }
                }}
                disabled={currentHasCycles}
                style={{
                  opacity: currentHasCycles ? 0.6 : 1,
                  cursor: currentHasCycles ? 'not-allowed' : 'pointer'
                }}
              >
                <span>
                  Layout: {clusteringMode === 'dag' ? 'Hierarchical (DAG)' : 'Domain Clustering'}
                  {currentHasCycles && ' (Cycles detected - DAG disabled)'}
                </span>
              </button>
            </div>
            <div className="dropdown-filter">
              <button 
                className="dropdown-button"
                onClick={() => setIsDomainOpen(!isDomainOpen)}
              >
                <span>Domains: {getSelectedText(selectedDomains)}</span>
                <span className="dropdown-arrow">▼</span>
              </button>
              {isDomainOpen && (
                <div className="dropdown-content">
                  {domains.map(domain => (
                    <label key={domain} className="filter-option">
                      <input
                        type="checkbox"
                        checked={selectedDomains.includes(domain)}
                        onChange={() => toggleDomain(domain)}
                      />
                      <span>{domain.charAt(0).toUpperCase() + domain.slice(1)}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="dropdown-filter">
              <button 
                className="dropdown-button"
                onClick={() => setIsTypeOpen(!isTypeOpen)}
              >
                <span>Types: {getSelectedText(selectedTypes)}</span>
                <span className="dropdown-arrow">▼</span>
              </button>
              {isTypeOpen && (
                <div className="dropdown-content">
                  {types.map(type => (
                    <label key={type} className="filter-option">
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(type)}
                        onChange={() => toggleType(type)}
                      />
                      <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
          <ForceGraph2D
            ref={graphRef}
            graphData={graphData}
            nodeId="id"
            nodeLabel="asset_key"
            nodeColor={getNodeColor}
            nodeVal={getNodeVal}
            linkColor={getLinkColor}
            linkWidth={2}
            linkDirectionalArrowLength={6}
            linkDirectionalArrowRelPos={1}
            dagMode={safeDagMode}
            dagLevelDistance={safeDagMode ? 60 : undefined}
            onNodeClick={handleNodeClick}
            onBackgroundClick={handleBackgroundClick}
            onRenderFramePre={(ctx: CanvasRenderingContext2D) => {
              if (!ctx) return;
              
              // Draw domain backgrounds
              domainClusters.forEach(cluster => {
                ctx.beginPath();
                ctx.arc(cluster.center.x, cluster.center.y, cluster.radius, 0, 2 * Math.PI);
                ctx.fillStyle = cluster.color;
                ctx.fill();
              });
            }}
          />
          {selectedNode && (
            <div className="node-details-panel">
              <div className="node-details-content">
                <h3>Node Details</h3>
                <div className="node-details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Asset Key:</span>
                    <span className="detail-value">{selectedNode.asset_key}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Domain:</span>
                    <span className="detail-value">{selectedNode.domain}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Type:</span>
                    <span className="detail-value">{selectedNode.type}</span>
                  </div>
                </div>
                <button 
                  className="close-button"
                  onClick={() => setSelectedNode(null)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyRetoolComponent;
