"use client";

import React, { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Code2, 
  Palette, 
  Zap, 
  BookOpen, 
  Users, 
  Sparkles,
  Play,
  ChevronRight,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  demo: React.ReactNode;
  benefits: string[];
  stats?: { label: string; value: string }[];
}

export default function FeatureShowcase() {
  const [activeFeature, setActiveFeature] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const features: Feature[] = [
    {
      id: "search",
      title: "AI-Powered Search",
      description: "Intelligent search that understands context and provides relevant results instantly.",
      icon: Search,
      color: "from-purple-500 to-pink-500",
      benefits: [
        "Natural language queries",
        "Instant results with highlighting",
        "Search history and suggestions",
        "Keyboard shortcuts (⌘K)"
      ],
      stats: [
        { label: "Search Speed", value: "<100ms" },
        { label: "Accuracy", value: "95%" }
      ],
      demo: (
        <div className="bg-background/50 backdrop-blur-sm rounded-lg p-4 border">
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-4 h-4 text-muted-foreground" />
            <div className="flex-1 bg-muted/50 rounded px-3 py-2 text-sm">
              How to implement authentication?
            </div>
          </div>
          <div className="space-y-2">
            {["JWT Authentication Guide", "OAuth2 Setup", "Session Management"].map((result, i) => (
              <motion.div
                key={result}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-2 p-2 bg-background/80 rounded text-sm"
              >
                <BookOpen className="w-3 h-3 text-primary" />
                {result}
              </motion.div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: "code",
      title: "Interactive Code Blocks",
      description: "Live code examples with syntax highlighting, copy functionality, and execution.",
      icon: Code2,
      color: "from-blue-500 to-cyan-500",
      benefits: [
        "Syntax highlighting for 100+ languages",
        "One-click copy to clipboard",
        "Live code execution",
        "Download as files"
      ],
      stats: [
        { label: "Languages", value: "100+" },
        { label: "Copy Rate", value: "89%" }
      ],
      demo: (
        <div className="bg-slate-900 rounded-lg p-4 text-sm font-mono">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-slate-400 ml-2">main.py</span>
            </div>
            <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
              Copy
            </Button>
          </div>
          <div className="text-slate-300">
            <span className="text-purple-400">from</span>{" "}
            <span className="text-blue-400">fastapi</span>{" "}
            <span className="text-purple-400">import</span>{" "}
            <span className="text-green-400">FastAPI</span>
            <br />
            <br />
            <span className="text-blue-400">app</span> = <span className="text-green-400">FastAPI</span>()
            <br />
            <br />
            <span className="text-purple-400">@app.get</span>(<span className="text-yellow-400">"/"</span>)
            <br />
            <span className="text-purple-400">def</span>{" "}
            <span className="text-blue-400">read_root</span>():
            <br />
            {"    "}<span className="text-purple-400">return</span>{" "}
            {"{\"Hello\": \"World\"}"}
          </div>
        </div>
      )
    },
    {
      id: "themes",
      title: "Beautiful Themes",
      description: "Customizable themes with dark/light mode and brand customization.",
      icon: Palette,
      color: "from-pink-500 to-rose-500",
      benefits: [
        "Dark and light mode support",
        "Custom brand colors",
        "Typography customization",
        "Responsive design"
      ],
      stats: [
        { label: "Themes", value: "12+" },
        { label: "Customization", value: "100%" }
      ],
      demo: (
        <div className="space-y-3">
          <Tabs defaultValue="light" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="light">Light</TabsTrigger>
              <TabsTrigger value="dark">Dark</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>
            <TabsContent value="light" className="mt-3">
              <div className="bg-white border rounded-lg p-3 text-black">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-blue-500 rounded"></div>
                  <div className="text-sm font-medium">Light Theme</div>
                </div>
                <div className="text-xs text-gray-600">Clean and minimal design</div>
              </div>
            </TabsContent>
            <TabsContent value="dark" className="mt-3">
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-purple-500 rounded"></div>
                  <div className="text-sm font-medium">Dark Theme</div>
                </div>
                <div className="text-xs text-slate-400">Easy on the eyes</div>
              </div>
            </TabsContent>
            <TabsContent value="custom" className="mt-3">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-3 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-white/20 rounded"></div>
                  <div className="text-sm font-medium">Custom Brand</div>
                </div>
                <div className="text-xs text-white/80">Your brand colors</div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )
    },
    {
      id: "performance",
      title: "Lightning Fast",
      description: "Optimized for speed with static generation and smart caching.",
      icon: Zap,
      color: "from-yellow-500 to-orange-500",
      benefits: [
        "Static site generation",
        "Smart caching strategies",
        "Optimized images",
        "Minimal JavaScript"
      ],
      stats: [
        { label: "Load Time", value: "<1s" },
        { label: "Lighthouse", value: "100" }
      ],
      demo: (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Page Load Speed</span>
            <Badge variant="secondary">0.8s</Badge>
          </div>
          <div className="space-y-2">
            {[
              { label: "First Contentful Paint", value: "0.3s", width: "30%" },
              { label: "Largest Contentful Paint", value: "0.6s", width: "60%" },
              { label: "Time to Interactive", value: "0.8s", width: "80%" }
            ].map((metric) => (
              <div key={metric.label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>{metric.label}</span>
                  <span className="text-green-500">{metric.value}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <motion.div
                    className="bg-green-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: metric.width }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }
  ];

  return (
    <section ref={containerRef} className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4">
            <Sparkles className="w-4 h-4 mr-2" />
            Features
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Everything You Need for
            <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Modern Documentation
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Built with the latest technologies and best practices to deliver 
            an exceptional documentation experience.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Feature List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                whileHover={{ scale: 1.02 }}
                className={`p-6 rounded-xl border cursor-pointer transition-all duration-300 ${
                  activeFeature === index 
                    ? 'bg-primary/5 border-primary/20 shadow-lg' 
                    : 'bg-background/50 border-border/50 hover:border-border'
                }`}
                onClick={() => setActiveFeature(index)}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${feature.color}`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground mb-4">{feature.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {feature.benefits.slice(0, 2).map((benefit, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <ChevronRight className="w-3 h-3 text-primary" />
                          {benefit}
                        </div>
                      ))}
                    </div>

                    {feature.stats && (
                      <div className="flex gap-4">
                        {feature.stats.map((stat, i) => (
                          <div key={i} className="text-center">
                            <div className="text-lg font-bold text-primary">{stat.value}</div>
                            <div className="text-xs text-muted-foreground">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Feature Demo */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="sticky top-8"
          >
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 border-b">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${features[activeFeature].color}`}>
                      <features[activeFeature].icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold">{features[activeFeature].title}</h3>
                  </div>
                  <p className="text-muted-foreground">{features[activeFeature].description}</p>
                </div>
                
                <div className="p-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeFeature}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {features[activeFeature].demo}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Device Preview */}
                <div className="px-6 pb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm text-muted-foreground">Responsive Design:</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Monitor className="w-3 h-3" />
                      Desktop
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Tablet className="w-3 h-3" />
                      Tablet
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Smartphone className="w-3 h-3" />
                      Mobile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}