import { en } from '../strings/en.js';
import { exportDevice, exportLevels, exportResearch, exportRuns } from '../export/csv.js';
import { exportStatsJson } from '../export/json.js';

export function ExportTools({ profile, board, profiles }) {
  return (
    <section className="stack export-tool">
      <h2>Download stats</h2>
      <p className="hint">{en.exportHelp}</p>
      <div className="row wrap">
        <button type="button" className="btn" data-testid="export-json" disabled={!profile} onClick={() => exportStatsJson(profile)}>
          {en.downloadJson}
        </button>
        <button type="button" className="btn" data-testid="export-runs" disabled={!profile} onClick={() => exportRuns(profile)}>
          {en.exportRuns}
        </button>
        <button type="button" className="btn" data-testid="export-levels" disabled={!profile} onClick={() => exportLevels(profile)}>
          {en.exportLevels}
        </button>
        <button type="button" className="btn" data-testid="export-device" onClick={() => exportDevice(board)}>
          {en.exportDevice}
        </button>
        <button type="button" className="btn" data-testid="export-research" onClick={() => exportResearch(profiles)}>
          {en.exportResearch}
        </button>
      </div>
    </section>
  );
}
