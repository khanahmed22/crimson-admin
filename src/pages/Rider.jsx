import { useState } from "react";
import { supabase } from "@/db/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/store/authStore";
import { Title } from "react-head";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import { Mail, Phone, IdCard, Trash2, Bike, HardHat } from "lucide-react";
import { toast } from "sonner";

export default function Riders() {
  const { session } = useAuth();
  const user_id = session?.user?.id;
  const queryClient = useQueryClient();

  /* -------------------- REST ID -------------------- */

  const fetchRestID = async () => {
    const { data, error } = await supabase
      .from("rest_list")
      .select("*")
      .eq("user_id", user_id)
      .maybeSingle();

    if (error) throw error;
    return data;
  };

  const { data: restIDQuery, isPending: restPending } = useQuery({
    queryKey: ["restID", user_id],
    queryFn: fetchRestID,
    enabled: !!user_id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

  const restID = restIDQuery?.id;

  /* -------------------- FETCH RIDERS -------------------- */

  const fetchRiders = async () => {
    const { data, error } = await supabase
      .from("riders")
      .select("*")
      .eq("restID", restID);

    if (error) throw error;
    return data;
  };

  const { data: RiderQuery, isPending } = useQuery({
    queryKey: ["riderQuery", restID],
    queryFn: fetchRiders,
    enabled: !!restID,
  });

  /* -------------------- CREATE RIDER -------------------- */

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    cnic: "",
    status: "active",
  });

  const createRider = async () => {
    if (!restID) throw new Error("Missing restaurant ID");

    const { error } = await supabase.from("riders").insert({
      ...form,
      restID,
      user_id
    });

    if (error) throw error;
  };

  const { mutate: createRiderM, isPending: creating } = useMutation({
    mutationFn: createRider,
    onSuccess: () => {
      toast.success("Rider created successfully");
      queryClient.invalidateQueries(["riderQuery", restID]);
      setOpen(false);
      setForm({
        name: "",
        email: "",
        phoneNumber: "",
        cnic: "",
        status: "active",
      });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create rider");
    },
  });

  /* -------------------- DELETE RIDER -------------------- */

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedRider, setSelectedRider] = useState(null);

  const deleteRider = async () => {
    if (!selectedRider) throw new Error("No rider selected");

    const { error } = await supabase
      .from("riders")
      .delete()
      .eq("id", selectedRider.id)
      .eq("restID", restID);

    if (error) throw error;
  };

  const { mutate: deleteRiderM, isPending: deleting } = useMutation({
    mutationFn: deleteRider,
    onSuccess: () => {
      toast.success("Rider deleted");
      queryClient.invalidateQueries(["riderQuery", restID]);
      setDeleteOpen(false);
      setSelectedRider(null);
    },
    onError: () => {
      toast.error("Failed to delete rider");
    },
  });

  if (isPending) {
        return (
          <div>
            <Title>Riders</Title>
            <div className="max-md:mt-10 min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-pink-50 p-6 flex items-center justify-center">
              <div className="max-w-4xl mx-auto ">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                  <div className="flex items-center justify-center space-x-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
                    <h2 className="text-xl max-md:text-sm font-semibold text-gray-700">
                      Loading Riders...
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

  /* -------------------- UI -------------------- */

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Title>Riders</Title>
      <div className="text-center mb-8 flex flex-col items-center justify-center">
        <div className="flex  items-center justify-center gap-x-3">
          <div className="flex items-center justify-center mt-3 w-16 h-16 max-md:w-12 max-md:h-12 bg-gradient-to-r from-rose-500 to-orange-500 rounded-2xl shadow-lg mb-4">
            <Bike className="w-8 h-8 max-md:w-6 max-md:h-6 text-white" />
          </div>
          <h2 className="text-2xl max-md:text-xl text-center font-bold bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent">
            Riders
          </h2>
        </div>
        <div className="w-24 h-1 bg-accent mx-auto rounded-full"></div>
      </div>
      <div className="flex items-end justify-end mb-6">
        <Button className="btn-accent" onClick={() => setOpen(true)}>
          + Add Rider
        </Button>
      </div>

      {restPending || isPending ? (
        <div className="text-sm text-muted-foreground">Loading riders...</div>
      ) : RiderQuery?.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {RiderQuery.map((r) => (
            <Card
  key={r.id}
  className="relative rounded-2xl border bg-white shadow-sm transition-all hover:shadow-lg"
>
  {/* Delete */}
  <Button
    variant="ghost"
    size="icon"
    className="absolute top-3 right-3 text-destructive hover:bg-destructive/10"
    onClick={() => {
      setSelectedRider(r);
      setDeleteOpen(true);
    }}
  >
    <Trash2 className="h-4 w-4" />
  </Button>

  {/* Header */}
  <CardHeader className="flex flex-row items-center gap-4 pb-3">
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
      <HardHat className="h-6 w-6 text-accent" />
    </div>

    <div className="flex-1">
      <CardTitle className="text-lg font-semibold leading-tight">
        {r.name || "Unnamed Rider"}
      </CardTitle>

      <Badge
        variant="secondary"
        className="mt-1 w-fit capitalize"
      >
        {r.status || "unknown"}
      </Badge>
    </div>
  </CardHeader>

  {/* Content */}
  <CardContent className="space-y-3 text-sm">
    <div className="flex items-center gap-3 text-muted-foreground">
      <Mail className="h-4 w-4" />
      <span className="truncate">{r.email || "N/A"}</span>
    </div>

    <div className="flex items-center gap-3 text-muted-foreground">
      <Phone className="h-4 w-4" />
      <span>{r.phoneNumber || "N/A"}</span>
    </div>

    <div className="flex items-center gap-3 text-muted-foreground">
      <IdCard className="h-4 w-4" />
      <span>{r.cnic || "N/A"}</span>
    </div>
  </CardContent>
</Card>

          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
  

  <h3 className="text-xl font-semibold text-foreground">
    No riders yet
  </h3>

  <p className="mt-1 max-w-sm text-sm text-muted-foreground">
    Add your delivery riders here to assign orders and track deliveries.
  </p>

  <Button
    className="btn-accent mt-6"
    onClick={() => setOpen(true)}
  >
    + Add First Rider
  </Button>
</div>

      )}

      {/* CREATE RIDER DIALOG */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Create Rider</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {["name", "email", "phoneNumber", "cnic", "status"].map((field) => (
              <div key={field}>
                <Label className="capitalize">{field}</Label>
                <Input
                  value={form[field]}
                  onChange={(e) =>
                    setForm({ ...form, [field]: e.target.value })
                  }
                />
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              className="btn-accent"
              onClick={() => createRiderM()}
              disabled={creating}
            >
              {creating ? "Creating..." : "Create Rider"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className='bg-white'>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete rider "{selectedRider?.name}"?
            </AlertDialogTitle>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteRiderM()}
              disabled={deleting}
              className="bg-red-500 text-white hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
