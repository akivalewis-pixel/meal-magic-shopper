import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { UtensilsCrossed, ShoppingCart, Calendar, TrendingUp, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardViewProps {
  mealsCount: number;
  groceryCount: number;
  weeklyPlansCount: number;
  onNavigate: (section: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  mealsCount,
  groceryCount,
  weeklyPlansCount,
  onNavigate
}) => {
  const stats = [
    {
      icon: UtensilsCrossed,
      label: "Meals Planned",
      value: mealsCount,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      action: () => onNavigate("meals")
    },
    {
      icon: ShoppingCart,
      label: "Items to Buy",
      value: groceryCount,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      action: () => onNavigate("shopping")
    },
    {
      icon: Calendar,
      label: "Saved Plans",
      value: weeklyPlansCount,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      action: () => onNavigate("meals")
    }
  ];

  const tips = [
    "💡 Save your favorite weekly plans for quick reuse",
    "🎯 Check off items as you shop to track progress",
    "⭐ Rate meals to remember your favorites",
    "📱 Share your shopping list with family"
  ];

  const randomTip = tips[Math.floor(Math.random() * tips.length)];

  return (
    <div className="container mx-auto px-4 py-4 space-y-6">
      {/* Welcome Header */}
      <div className="text-center py-2">
        <h1 className="text-2xl font-bold text-foreground">
          Welcome to Meal Magic
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your weekly meal planning companion
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
              onClick={stat.action}
            >
              <CardContent className="p-3 flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <span className="text-2xl font-bold text-foreground">
                  {stat.value}
                </span>
                <span className="text-xs text-muted-foreground text-center">
                  {stat.label}
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigate("meals")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl p-4 shadow-md hover:shadow-lg transition-all active:scale-[0.98] text-left flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">Plan Meals</p>
              <p className="text-xs opacity-80">Add meals to your weekly plan</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate("shopping")}
            className="bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-xl p-4 shadow-md hover:shadow-lg transition-all active:scale-[0.98] text-left flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-secondary-foreground/10 flex items-center justify-center flex-shrink-0">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">Shopping List</p>
              <p className="text-xs opacity-80">View and manage groceries</p>
            </div>
          </button>
        </div>
      </div>

      {/* Weekly Progress Card */}
      {mealsCount > 0 && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <p className="font-semibold text-sm text-foreground">This Week's Progress</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Meals planned</span>
                <span className="font-medium text-foreground">{mealsCount} / 7</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((mealsCount / 7) * 100, 100)}%` }}
                />
              </div>
            </div>

            {mealsCount >= 7 && (
              <div className="flex items-center gap-2 text-sm text-primary">
                <CheckCircle2 className="h-4 w-4" />
                Week complete! Great job! 🎉
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tip Card */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">💡</span>
            <div>
              <p className="font-semibold text-sm text-foreground">Pro Tip</p>
              <p className="text-xs text-muted-foreground mt-0.5">{randomTip}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Getting Started Card for New Users */}
      {mealsCount === 0 && groceryCount === 0 && (
        <Card className="border-primary/20">
          <CardContent className="p-6 text-center space-y-3">
            <span className="text-4xl">🍽️</span>
            <h3 className="font-semibold text-foreground">Ready to get started?</h3>
            <p className="text-sm text-muted-foreground">
              Begin by adding your first meal to the weekly plan
            </p>
            <Button
              onClick={() => onNavigate("meals")}
              className="mt-2"
            >
              Start Planning
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
