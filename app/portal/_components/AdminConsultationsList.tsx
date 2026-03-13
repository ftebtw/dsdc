"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  consultationStatusClass,
  consultationStatusLabel,
} from '@/app/portal/admin/consultations/config';

type ConsultationListItem = {
  id: string;
  consultDate: string;
  studentName: string;
  parentName: string;
  studentGrade: string;
  howFoundUs: string;
  recommendedClass: string;
  status: string;
};

type Props = {
  consultations: ConsultationListItem[];
};

export default function AdminConsultationsList({ consultations }: Props) {
  const router = useRouter();

  function openConsultation(id: string) {
    router.push(`/portal/admin/consultations/${id}`);
  }

  if (consultations.length === 0) {
    return <p className="text-sm text-charcoal/70 dark:text-navy-300">No consultations found for the selected filters.</p>;
  }

  return (
    <>
      <div className="hidden md:block rounded-xl border border-warm-200 dark:border-navy-600 overflow-x-auto">
        <table className="w-full min-w-[980px] text-sm">
          <thead className="bg-warm-100 dark:bg-navy-900/60">
            <tr>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Student Name</th>
              <th className="px-4 py-3 text-left">Parent Name</th>
              <th className="px-4 py-3 text-left">Grade</th>
              <th className="px-4 py-3 text-left">How Found Us</th>
              <th className="px-4 py-3 text-left">Recommended Class</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {consultations.map((consultation) => (
              <tr
                key={consultation.id}
                role="link"
                tabIndex={0}
                onClick={() => openConsultation(consultation.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openConsultation(consultation.id);
                  }
                }}
                className="cursor-pointer border-t border-warm-200 dark:border-navy-700 hover:bg-warm-50 dark:hover:bg-navy-800/60 focus:outline-none focus:bg-warm-50 dark:focus:bg-navy-800/60"
              >
                <td className="px-4 py-3">{consultation.consultDate}</td>
                <td className="px-4 py-3 font-medium text-navy-800 dark:text-white">{consultation.studentName}</td>
                <td className="px-4 py-3">{consultation.parentName}</td>
                <td className="px-4 py-3">{consultation.studentGrade}</td>
                <td className="px-4 py-3">{consultation.howFoundUs}</td>
                <td className="px-4 py-3">{consultation.recommendedClass}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${consultationStatusClass(consultation.status)}`}>
                    {consultationStatusLabel(consultation.status)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/portal/admin/consultations/${consultation.id}`}
                    onClick={(event) => event.stopPropagation()}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {consultations.map((consultation) => (
          <article
            key={consultation.id}
            role="link"
            tabIndex={0}
            onClick={() => openConsultation(consultation.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openConsultation(consultation.id);
              }
            }}
            className="cursor-pointer rounded-xl border border-warm-200 dark:border-navy-600 bg-warm-50 dark:bg-navy-900 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-navy-800 dark:text-white">{consultation.studentName}</p>
                <p className="text-sm text-charcoal/65 dark:text-navy-300">{consultation.parentName}</p>
              </div>
              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${consultationStatusClass(consultation.status)}`}>
                {consultationStatusLabel(consultation.status)}
              </span>
            </div>
            <div className="mt-3 space-y-1 text-sm text-charcoal/75 dark:text-navy-300">
              <p>Date: {consultation.consultDate}</p>
              <p>Grade: {consultation.studentGrade}</p>
              <p>How Found Us: {consultation.howFoundUs}</p>
              <p>Recommended Class: {consultation.recommendedClass}</p>
            </div>
            <div className="mt-3">
              <Link
                href={`/portal/admin/consultations/${consultation.id}`}
                onClick={(event) => event.stopPropagation()}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Open consultation
              </Link>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
