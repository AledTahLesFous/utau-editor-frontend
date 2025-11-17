import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'durationSteps'
})
export class DurationStepsPipe implements PipeTransform {
  /**
   * Convertit des steps en secondes ou format mm:ss
   * @param steps nombre de 1/16e
   * @param tempo BPM du projet
   */
  transform(steps: number, tempo: number, format: 'mm:ss' | 's' = 'mm:ss'): string {
    if (!steps || !tempo) return '0:00';
    const stepDurationSec = 60 / tempo / 4; // 1 step = 1/16 de mesure
    const totalSeconds = steps * stepDurationSec;

    if (format === 's') return totalSeconds.toFixed(2);

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2,'0')}`;
  }
}
