import { redirect } from "next/navigation";
import { container } from "@/di/container";

/**
 * GET /auth/expired: tujuan redirect saat backend membalas 401 UNAUTHORIZED di tengah render
 * (misalnya token valid secara waktu tapi tanda tangannya ditolak karena JWT_SECRET diganti).
 * Cookie hanya boleh dihapus di Route Handler atau Server Action, bukan saat Server Component dirender,
 * jadi penghapusannya dilakukan di sini, lalu user diarahkan ke Login.
 */
export async function GET() {
  await container.auth().signOut();
  redirect("/login");
}
