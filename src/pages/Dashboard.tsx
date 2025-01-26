import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { format } from "date-fns";

type BookingStats = {
  totalRevenue: number;
  totalBookings: number;
  averageBookingValue: number;
  completedBookings: number;
};

type RevenueByMonth = {
  month: string;
  revenue: number;
};

type ServiceRevenue = {
  name: string;
  revenue: number;
};

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState<BookingStats>({
    totalRevenue: 0,
    totalBookings: 0,
    averageBookingValue: 0,
    completedBookings: 0,
  });
  const [monthlyRevenue, setMonthlyRevenue] = useState<RevenueByMonth[]>([]);
  const [serviceRevenue, setServiceRevenue] = useState<ServiceRevenue[]>([]);

  useEffect(() => {
    const checkUserRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profile || !["owner", "operator"].includes(profile.role)) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to view the dashboard",
          variant: "destructive",
        });
        navigate("/");
      }
    };

    checkUserRole();
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all bookings
      const { data: bookings, error } = await supabase
        .from("bookings")
        .select("*");

      if (error) throw error;

      // Calculate basic stats
      const totalRevenue = bookings.reduce(
        (sum, booking) => sum + Number(booking.total_price),
        0
      );
      const completedBookings = bookings.filter(
        (booking) => booking.status === "completed"
      ).length;

      setStats({
        totalRevenue,
        totalBookings: bookings.length,
        averageBookingValue: totalRevenue / bookings.length || 0,
        completedBookings,
      });

      // Calculate monthly revenue
      const monthlyData = bookings.reduce((acc: Record<string, number>, booking) => {
        const month = format(new Date(booking.start_date), "MMM yyyy");
        acc[month] = (acc[month] || 0) + Number(booking.total_price);
        return acc;
      }, {});

      setMonthlyRevenue(
        Object.entries(monthlyData).map(([month, revenue]) => ({
          month,
          revenue,
        }))
      );

      // Calculate revenue by service type
      const serviceData = bookings.reduce(
        (acc: Record<string, number>, booking) => {
          if (booking.accommodation_id) acc.Accommodations = (acc.Accommodations || 0) + Number(booking.total_price);
          if (booking.transportation_id) acc.Transportation = (acc.Transportation || 0) + Number(booking.total_price);
          if (booking.attraction_id) acc.Attractions = (acc.Attractions || 0) + Number(booking.total_price);
          if (booking.meal_id) acc.Meals = (acc.Meals || 0) + Number(booking.total_price);
          return acc;
        },
        {}
      );

      setServiceRevenue(
        Object.entries(serviceData).map(([name, revenue]) => ({
          name,
          revenue,
        }))
      );
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-8">Sales Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
            <CardDescription>Overall earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ${stats.totalRevenue.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Bookings</CardTitle>
            <CardDescription>Number of bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {stats.totalBookings.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Booking Value</CardTitle>
            <CardDescription>Revenue per booking</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ${stats.averageBookingValue.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completed Bookings</CardTitle>
            <CardDescription>Successfully completed</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {stats.completedBookings.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
            <CardDescription>Revenue trend over time</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ChartContainer
              config={{
                revenue: {
                  theme: {
                    light: "#8B5CF6",
                    dark: "#D946EF",
                  },
                },
              }}
            >
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend content={<ChartLegendContent />} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-revenue)"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by Service Type</CardTitle>
            <CardDescription>Distribution across services</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ChartContainer
              config={{
                revenue: {
                  theme: {
                    light: "#F97316",
                    dark: "#0EA5E9",
                  },
                },
              }}
            >
              <BarChart data={serviceRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend content={<ChartLegendContent />} />
                <Bar dataKey="revenue" fill="var(--color-revenue)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;