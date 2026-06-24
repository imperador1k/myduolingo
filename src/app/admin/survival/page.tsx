import { db } from "@/db/drizzle";
import { survivalScenarios, courses, units } from "@/db/schema";
import {
  generateSurvivalScenario,
  deleteSurvivalScenario,
} from "@/actions/admin-survival";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Trash2 } from "lucide-react";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AdminSurvivalPage() {
  const allScenarios = await db.query.survivalScenarios.findMany({
    with: {
      course: true,
      unit: true,
    },
    orderBy: (scenarios, { desc }) => [desc(scenarios.id)],
  });

  const allCourses = await db.query.courses.findMany();
  const allUnits = await db.query.units.findMany();

  return (
    <div className="flex flex-col gap-6 w-full pb-20">
      <div className="flex items-center gap-3">
        <div className="bg-sky-500/10 p-3 rounded-xl border border-sky-500/20">
          <ShieldAlert className="w-6 h-6 text-sky-500" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
            Sobrevivência AI
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Gere as missões e papéis dos NPCs para o modo Sobrevivência.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-stone-200 dark:border-slate-800 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
          Gerar Missão com IA{" "}
          <span className="bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-white text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider">
            Automático
          </span>
        </h2>
        <form
          action={async (formData: FormData) => {
            "use server";
            await generateSurvivalScenario({
              targetLevel: formData.get("targetLevel") as string,
              courseId: Number(formData.get("courseId")),
              unitId: Number(formData.get("unitId")),
            });
          }}
          className="flex flex-col gap-4 max-w-2xl"
        >
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-500">
                Curso Base
              </label>
              <select
                name="courseId"
                required
                className="h-10 px-3 rounded-lg border-2 border-stone-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-950 font-medium outline-none focus:border-sky-500"
              >
                {allCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.languageCode})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-500">
                Unidade (Tema da Missão)
              </label>
              <select
                name="unitId"
                required
                className="h-10 px-3 rounded-lg border-2 border-stone-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-950 font-medium outline-none focus:border-sky-500"
              >
                {allUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    Unit {u.order}: {u.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-32 flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-500">
                Dificuldade
              </label>
              <select
                name="targetLevel"
                className="h-10 px-3 rounded-lg border-2 border-stone-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-950 font-medium outline-none focus:border-sky-500"
              >
                <option value="A1">A1</option>
                <option value="A2">A2</option>
                <option value="B1">B1</option>
                <option value="B2">B2</option>
                <option value="C1">C1</option>
                <option value="C2">C2</option>
              </select>
            </div>
          </div>

          <Button
            type="submit"
            className="w-fit bg-gradient-to-r from-fuchsia-500 to-indigo-500 hover:opacity-90 text-white font-bold mt-2 border-b-4 border-indigo-700 active:translate-y-[2px] active:border-b-2"
          >
            ✨ Gerar Missão via IA
          </Button>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-stone-200 dark:border-slate-800 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">
          Missões Existentes ({allScenarios.length})
        </h2>

        {allScenarios.length === 0 ? (
          <div className="text-center py-10 opacity-50 font-bold">
            Nenhuma missão criada.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {allScenarios.map((sc) => (
              <div
                key={sc.id}
                className="flex justify-between items-center p-4 border-2 border-stone-200 dark:border-slate-800 rounded-2xl"
              >
                <div>
                  <div className="flex gap-2 items-center mb-1">
                    <span className="font-black text-slate-800 dark:text-slate-100">
                      {sc.title}
                    </span>
                    <span className="bg-sky-100 text-sky-600 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {sc.targetLevel}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-500 line-clamp-1">
                    {sc.description}
                  </p>
                  <p className="text-[11px] font-bold text-stone-400 mt-1 uppercase tracking-widest">
                    Curso: {sc.course?.title} • Unidade: {sc.unit?.order}
                  </p>
                </div>

                <form
                  action={async () => {
                    "use server";
                    await deleteSurvivalScenario(sc.id);
                  }}
                >
                  <Button
                    variant="ghost"
                    className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
