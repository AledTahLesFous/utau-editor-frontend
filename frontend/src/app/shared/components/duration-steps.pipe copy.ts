import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'durationInSeconds',
  standalone: true
})
export class DurationInSecondsPipe implements PipeTransform {
  /**
   * Convertit une durée en "steps" en secondes selon le tempo BPM.
   * @param steps nombre de steps
   * @param tempo BPM
   * @param stepsPerBeat nombre de steps par temps (default 4 steps par temps)
   */
  transform(steps: number, tempo: number = 120, stepsPerBeat: number = 4): string {
    if (!steps || !tempo) return '0';
    const secondsPerBeat = 60 / tempo;
    const beats = steps / stepsPerBeat;
    const seconds = beats * secondsPerBeat;
    return seconds.toFixed(2); // affichage avec 2 décimales
  }
}
