import { useEffect, useState } from "react";
import Mainlayout from "@/layout/Mainlayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { toast } from "react-toastify";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useRouter } from "next/router";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

const CheckoutForm = ({ clientSecret, plan, onSuccess }: { clientSecret: string, plan: string, onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required'
    });

    if (error) {
      toast.error(error.message);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      try {
        const token = JSON.parse(localStorage.getItem("user") || "{}").token;
        const res = await axiosInstance.post("/subscription/confirm", {
          paymentIntentId: paymentIntent.id,
          plan
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success(res.data.message);
        onSuccess();
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to confirm subscription");
      }
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button disabled={!stripe || loading} className="w-full bg-blue-600 hover:bg-blue-700">
        {loading ? "Processing..." : "Pay Now"}
      </Button>
    </form>
  );
};

const SubscriptionPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [currentSub, setCurrentSub] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/auth");
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [plansRes, subRes] = await Promise.all([
        axiosInstance.get("/subscription/plans"),
        axiosInstance.get("/subscription/my-subscription", {
          headers: { Authorization: `Bearer ${user?.token}` }
        })
      ]);
      setPlans(plansRes.data.data);
      setCurrentSub(subRes.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planKey: string) => {
    if (planKey === "free") return;
    try {
      const res = await axiosInstance.post("/subscription/create-intent", { plan: planKey }, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setClientSecret(res.data.clientSecret);
      setSelectedPlan(planKey);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create payment intent");
    }
  };

  if (loading) return <Mainlayout><div className="text-center mt-10">Loading...</div></Mainlayout>;

  return (
    <Mainlayout>
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-gray-600">Upgrade to ask more questions and unlock premium features.</p>
          {currentSub && (
            <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg inline-block">
              <p className="font-medium text-orange-800">
                Current Plan: <span className="uppercase font-bold">{currentSub.plan}</span>
              </p>
              <p className="text-sm text-orange-600">
                Daily Limit: {currentSub.dailyLimit} questions
              </p>
              {currentSub.validUntil && (
                <p className="text-xs text-orange-500 mt-1">Valid until {new Date(currentSub.validUntil).toLocaleDateString()}</p>
              )}
            </div>
          )}
        </div>

        {clientSecret ? (
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Complete Payment</CardTitle>
                <CardDescription>You are subscribing to the {selectedPlan} plan.</CardDescription>
              </CardHeader>
              <CardContent>
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm clientSecret={clientSecret} plan={selectedPlan} onSuccess={() => {
                    setClientSecret("");
                    fetchData();
                  }} />
                </Elements>
                <Button variant="ghost" className="w-full mt-4" onClick={() => setClientSecret("")}>Cancel</Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((p: any) => (
              <Card key={p.key} className={`flex flex-col ${currentSub?.plan === p.key ? 'border-orange-500 shadow-md' : ''}`}>
                <CardHeader className="text-center">
                  <CardTitle className="text-xl uppercase">{p.name}</CardTitle>
                  <div className="text-3xl font-bold mt-2">
                    {p.price === 0 ? "Free" : `₹${p.price}`}
                    <span className="text-sm font-normal text-gray-500">/mo</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <ul className="space-y-3 mb-6 text-sm text-gray-600 text-center">
                    <li><span className="font-bold">{p.dailyLimit}</span> questions per day</li>
                    <li>Community access</li>
                    {p.price > 0 && <li>Priority support</li>}
                  </ul>
                  <Button 
                    onClick={() => handleSubscribe(p.key)}
                    disabled={p.key === "free" || currentSub?.plan === p.key}
                    className={`w-full ${p.key === "free" ? "bg-gray-200 text-gray-600" : "bg-blue-600 hover:bg-blue-700"}`}
                  >
                    {currentSub?.plan === p.key ? "Current Plan" : p.key === "free" ? "Free Forever" : "Subscribe"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Mainlayout>
  );
};

export default SubscriptionPage;
