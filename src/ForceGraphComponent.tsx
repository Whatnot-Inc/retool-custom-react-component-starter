import React, { useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import './ForceGraphComponent.css';

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

interface ForceGraphProps {
  nodes: Node[];
  edges: Edge[];
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

const ForceGraphComponent: React.FC<ForceGraphProps> = ({ nodes, edges }) => {
  const graphRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [domainClusters, setDomainClusters] = useState<DomainCluster[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [isDomainOpen, setIsDomainOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);

  // Get unique domains and types for the filters
  const domains = [...new Set(nodes.map(node => node.domain))];
  const types = [...new Set(nodes.map(node => node.type))];

  // Transform the data for the force graph
  const graphData = {
    nodes: nodes
      .filter(node => {
        const domainMatch = selectedDomains.length === 0 || selectedDomains.includes(node.domain);
        const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(node.type);
        return domainMatch && typeMatch;
      })
      .map(node => ({
        id: node.asset_key,
        ...node
      })),
    links: edges
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
        ...edge
      }))
  };

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

  const getLinkColor = (link: any) => {
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
    <div ref={containerRef} className="force-graph-container">
      <div className="graph-controls">
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
        linkColor={getLinkColor}
        linkWidth={2}
        linkDirectionalArrowLength={6}
        linkDirectionalArrowRelPos={1}
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
  );
};

export default ForceGraphComponent; 