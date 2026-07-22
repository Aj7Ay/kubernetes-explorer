import type { Module } from '../types';
import { part1Modules } from './part1';
import { part2Modules } from './part2';
import { part3Modules } from './part3';
import { part4Modules } from './part4';

export const containerdCourse: Module[] = [
  ...part1Modules,
  ...part2Modules,
  ...part3Modules,
  ...part4Modules,
];

export function findLesson(moduleId: string, lessonId: string) {
  const mod = containerdCourse.find((m) => m.id === moduleId);
  const lesson = mod?.lessons.find((l) => l.id === lessonId);
  return { mod, lesson };
}

export function flatLessons() {
  const out: { moduleId: string; lessonId: string; moduleTitle: string; lessonTitle: string; part: string }[] = [];
  for (const m of containerdCourse) {
    for (const l of m.lessons) {
      out.push({
        moduleId: m.id,
        lessonId: l.id,
        moduleTitle: m.title,
        lessonTitle: l.title,
        part: m.part,
      });
    }
  }
  return out;
}
