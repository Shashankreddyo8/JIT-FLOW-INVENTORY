import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, BookOpen, Video, MessageCircle, FileText, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      icon: BookOpen,
      title: "Getting Started",
      description: "Learn the basics of JIT inventory management",
      articles: [
        { title: "Platform Overview", content: "Welcome to your JIT inventory management platform. This guide will walk you through the main features and help you get started quickly." },
        { title: "Setting Up Your First Inventory Item", content: "To add an item: Navigate to Inventory → Click 'Add Item' → Fill in details including SKU, name, quantities, and supplier → Save. The item will appear in your inventory list." },
        { title: "Understanding Dashboard Metrics", content: "The dashboard shows: Total Items (all inventory), Low Stock Items (below reorder point), Active Orders (pending/in-transit), and Total Suppliers. Use these metrics to monitor your inventory health." }
      ]
    },
    {
      icon: Zap,
      title: "AI Features",
      description: "Leverage AI for forecasting and recommendations",
      articles: [
        { title: "Demand Forecasting Explained", content: "Our AI analyzes your historical order data to predict future demand. Click 'Forecast Demand' on any inventory item to see predictions for the next 30 days with confidence scores." },
        { title: "Purchase Recommendations", content: "The system automatically identifies low-stock items and suggests optimal purchase quantities based on demand patterns, lead times, and supplier performance." },
        { title: "Supplier Analytics", content: "AI-powered supplier analysis evaluates performance metrics, identifies strengths/weaknesses, and provides actionable recommendations for supplier relationships." }
      ]
    },
    {
      icon: FileText,
      title: "Orders & Suppliers",
      description: "Manage orders and supplier relationships",
      articles: [
        { title: "Creating Purchase Orders", content: "To create an order: Go to Orders → New Order → Select supplier → Add items with quantities → Review totals → Submit. Track order status in real-time." },
        { title: "Managing Suppliers", content: "Add suppliers with contact details, track their ratings, average delivery times, and total orders. Use this data to make informed sourcing decisions." },
        { title: "Order Status Tracking", content: "Orders progress through: Pending → Confirmed → In Transit → Delivered. Update status as orders move through your supply chain." }
      ]
    },
    {
      icon: Video,
      title: "Video Tutorials",
      description: "Watch step-by-step guides",
      articles: [
        { title: "Dashboard Tour (5 min)", content: "A comprehensive walkthrough of the main dashboard, explaining each widget and metric in detail." },
        { title: "Inventory Management Best Practices (10 min)", content: "Learn professional tips for maintaining optimal inventory levels, setting reorder points, and avoiding stockouts." },
        { title: "Using AI Forecasting (7 min)", content: "See how to leverage AI predictions to optimize your purchasing decisions and reduce carrying costs." }
      ]
    }
  ];

  const filteredCategories = categories.map(category => ({
    ...category,
    articles: category.articles.filter(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.articles.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Help Center</h1>
        <p className="text-muted-foreground">
          Find answers, guides, and tutorials
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search for help articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Documentation</CardTitle>
              <CardDescription className="text-xs">Comprehensive guides</CardDescription>
            </div>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="p-2 rounded-lg bg-secondary/10">
              <Video className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <CardTitle className="text-base">Video Tutorials</CardTitle>
              <CardDescription className="text-xs">Visual learning</CardDescription>
            </div>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="p-2 rounded-lg bg-info/10">
              <MessageCircle className="h-5 w-5 text-info" />
            </div>
            <div>
              <CardTitle className="text-base">Contact Support</CardTitle>
              <CardDescription className="text-xs">Get personalized help</CardDescription>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Help Articles */}
      <div className="space-y-6">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>{category.title}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.articles.map((article, articleIndex) => (
                      <AccordionItem key={articleIndex} value={`item-${index}-${articleIndex}`}>
                        <AccordionTrigger className="text-left hover:no-underline">
                          {article.title}
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {article.content}
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No articles found matching "{searchQuery}"</p>
              <Button variant="link" onClick={() => setSearchQuery("")}>Clear search</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default HelpCenter;
