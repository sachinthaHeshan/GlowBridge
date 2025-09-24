import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Star, Clock, ArrowLeft, Filter } from "lucide-react";
import Link from "next/link";

export default async function ServiceCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const categoryName = category.charAt(0).toUpperCase() + category.slice(1);

  const services = [
    {
      id: 1,
      name: "Classic Haircut & Style",
      description: "Professional cut with wash, blow-dry and styling",
      duration: "60 min",
      price: "LKR 3,500",
      rating: 4.8,
      reviews: 124,
      salons: 15,
    },
    {
      id: 2,
      name: "Hair Color & Highlights",
      description: "Full color service with premium products",
      duration: "120 min",
      price: "LKR 8,500",
      rating: 4.9,
      reviews: 89,
      salons: 12,
    },
    {
      id: 3,
      name: "Keratin Treatment",
      description: "Smoothing treatment for frizz-free hair",
      duration: "180 min",
      price: "LKR 15,000",
      rating: 4.7,
      reviews: 67,
      salons: 8,
    },
    {
      id: 4,
      name: "Bridal Hair Package",
      description: "Complete bridal styling with trial session",
      duration: "240 min",
      price: "LKR 25,000",
      rating: 4.9,
      reviews: 156,
      salons: 20,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-foreground">
                {categoryName} Services
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder={`Search ${categoryName.toLowerCase()} services...`}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Under LKR 5,000</SelectItem>
                  <SelectItem value="mid">LKR 5,000 - 15,000</SelectItem>
                  <SelectItem value="high">Above LKR 15,000</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Under 1 hour</SelectItem>
                  <SelectItem value="medium">1-2 hours</SelectItem>
                  <SelectItem value="long">2+ hours</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card
              key={service.id}
              className="group hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {service.name}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {service.description}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    {service.salons} salons
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {service.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    {service.rating} ({service.reviews})
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-lg font-semibold text-primary">
                    {service.price}
                  </div>
                  <Link href={`/book/${service.id}`}>
                    <Button size="sm">Select Salon</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Popular Combinations */}
        <section className="mt-16">
          <h3 className="text-2xl font-bold text-foreground mb-6">
            Popular Combinations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg">Hair Care Package</CardTitle>
                <CardDescription>Cut + Color + Treatment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-muted-foreground line-through">
                      LKR 27,000
                    </div>
                    <div className="text-lg font-semibold text-primary">
                      LKR 22,000
                    </div>
                    <div className="text-sm text-green-600">Save LKR 5,000</div>
                  </div>
                  <Button>Book Package</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg">Bridal Special</CardTitle>
                <CardDescription>Hair + Makeup + Trial</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-muted-foreground line-through">
                      LKR 35,000
                    </div>
                    <div className="text-lg font-semibold text-primary">
                      LKR 28,000
                    </div>
                    <div className="text-sm text-green-600">Save LKR 7,000</div>
                  </div>
                  <Button>Book Package</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
