/* Innfini Command & Control · the control room
   One video wall, six use cases. Every scenario is illustrative — no live data. */
(function () {
  'use strict';
  var WALL = document.getElementById('ccwall');
  if (!WALL) return;
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ASSETS = WALL.getAttribute('data-assets') || '../assets/product/';

  /* ───────────── helpers ───────────── */
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function q(sel, root) { return (root || document).querySelector(sel); }
  function qa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  var HEX = '0123456789abcdef';
  function hash(seed) { var s = (seed * 2654435761) >>> 0, o = ''; for (var i = 0; i < 16; i++) { s = (s * 1103515245 + 12345) >>> 0; o += HEX[(s >>> 16) & 15]; } return o; }
  function shortHash(seed) { var x = hash(seed); return x.slice(0, 4) + '…' + x.slice(12); }
  var T0 = 18 * 3600 + 36 * 60 + 4;
  function ts(sec) { var t = T0 + sec, hh = Math.floor(t / 3600) % 24, mm = Math.floor(t / 60) % 60, ss = t % 60; return (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm + ':' + (ss < 10 ? '0' : '') + ss; }
  function mmss(sec) { var m = Math.floor(sec / 60), s = sec % 60; return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s; }
  var EL = { detect: 0, verify: 12, assess: 24, recommend: 50, approve: 62, dispatch: 91, debrief: 104 };
  var STAGE_IDS = ['detect', 'verify', 'assess', 'recommend', 'approve', 'dispatch', 'debrief'];
  function inZoom(el) { return !!el.closest('.wall-zoom'); }

  /* ───────────── use cases ───────────── */
  var USE = [
    { id: 'city', t: 'City operations', short: 'City ops', page: 'cc-smart-city-ops.html', pt: 'Smart City Operations',
      inc: { id: 'INC-0007', title: 'Fire alarm', where: 'Riverside Mall · Zone 4', sev: 'HIGH' },
      baseline: [['18:33:40', 'TRAFFIC', 'Flow nominal · Corniche Rd'], ['18:34:12', 'ACCESS', 'Gate 3 · 1,204 badge events today'], ['18:35:02', 'WEATHER', '31°C · wind 9 kt NW'], ['18:35:48', 'CAM', 'CAM-4-11 · healthy · 25 fps']],
      sig: [['SMK-4-08', 'Smoke detected · Zone 4 · Level 2'], ['CAM-4-12', 'Haze confirmed · 0.91']], risk: 'Occupancy 1,860 · asset critical · HIGH',
      cams: { ids: ['CAM-4-11', 'CAM-4-12', 'CAM-4-15', 'CAM-G3'], imgs: ['cc-sa-hero.webp', 'cc-ad-hero.webp', 'cc-ve-hero.webp', 'cc-po-hero.webp'], hit: 'HAZE 0.91' },
      unit: 'ENGINE-12', units: [['ENGINE-12', 'Fire', 'AVAILABLE', '3 min'], ['PATROL-22', 'Police', 'AVAILABLE', '2 min'], ['AMB-A1', 'EMS', 'ON CALL', '5 min'], ['ENGINE-7', 'Fire', 'BUSY', '—'], ['MALL-SEC', 'Site', 'ON SITE', '0 min']],
      rec: 'Dispatch Engine-12 via Al Salam St to Gate 3. Notify mall ops; begin EVAC-2 on Level 2. Nearest engine, 3 min, route clear.', ev: ['SMK-4-08', 'CAM-4-12', 'EVAC-2', '3 precedents'], conf: 92, approver: 'A. RAHMAN · DISPATCHER',
      sop: { name: 'EVAC-2', desc: 'Fire alarm · retail · occupied', steps: ['Confirm two independent signals', 'Notify mall operations desk', 'Dispatch nearest available engine', 'Evacuate Zone 4 · Level 2', 'Field confirmation · close'] },
      agencies: ['Civil Defence', 'Police', 'EMS', 'Municipality', 'Mall operations'], pre: 4, resolved: 'CONTAINED · 18:41',
      map: { kind: 'city', title: 'Live map · Zone 4 · Riverside', inc: [425, 189], site: { x: 380, y: 150, w: 96, h: 78, l: 'RIVERSIDE MALL', s: 'ZONE 4 · L2' }, streets: ['AL SALAM ST', 'CORNICHE RD'], zones: ['Z1', 'Z2', 'Z3', 'Z5'],
        units: [{ id: 'ENGINE-12', x: 110, y: 346, c: 'e' }, { id: 'PATROL-22', x: 560, y: 90, c: 'p' }, { id: 'AMB-A1', x: 200, y: 80, c: 'a' }], route: 'M110 346 L110 264 L300 264 L300 236 L378 236', target: { x: 378, y: 236, l: 'GATE 3' },
        st: ['SIGNAL · ZONE 4', '2 SIGNALS · INC-0007', 'SEVERITY HIGH · EVAC-2', 'ROUTE PROPOSED · 3 MIN', 'APPROVED · DISPATCHING', 'ENGINE-12 EN ROUTE', 'CONTAINED · 18:41'] },
      images: [['cc-sa-cop.webp', 'Common operating picture', 'ALL AGENCIES · LIVE', 'r', '69%', '26%'], ['cc-sa-playback.webp', 'Event playback', 'DETECTED · ASSIGNED · RESOLVED', 'run'], ['cc-ad-policies.webp', 'Action policies', 'AUTO · ATTENDED · SUPERVISED · BLOCKED', 'hl', '64%', '29%', '31%', '15%'], ['cc-ad-history.webp', 'Decision history', 'EVERY STEP · TIMESTAMPED', 'hl', '67%', '14%', '30%', '60%'], ['cc-sa-response.webp', 'Coordinated response', 'INCIDENT I-01', 'r', '47%', '48%'], ['cc-ad-loop.webp', 'The loop end to end', 'DETECT → LEARN', 'r', '38%', '44%']],
      cap: ['A smoke detector fires in Zone 4. The nearest cameras are pulled forward automatically.', 'Camera vision confirms haze. Two independent signals agree — INC-0007 is opened 12 s after the first signal.', 'Risk is scored from occupancy, asset criticality and precedent. SOP EVAC-2 is attached; mall operations are alerted.', 'The agent drafts the response with cited evidence and a confidence value. The route is drawn before anyone moves.', 'A named dispatcher approves. The approval is written to the ledger with identity, time and reasoning.', 'Engine-12 rolls. Five agencies are notified in 9 s and the Gate 3 camera tracks the unit in.', 'Contained. The audit chain verifies itself and the after-action record is ready the same shift.'] },

    { id: 'ps', t: 'Public safety & 911', short: '911', page: 'cc-public-safety.html', pt: 'Public Safety & 911',
      inc: { id: 'INC-2025-0841', title: 'Road collision · injuries', where: '5th & Main · high-speed segment', sev: 'HIGH' },
      baseline: [['18:33:10', 'CAD', '14 active calls · 3 pending'], ['18:34:05', 'TRAFFIC', 'Main St · 41 km/h avg · nominal'], ['18:34:50', 'UNITS', '12 of 14 units available'], ['18:35:30', 'RMS', 'Case 2025-CR-0429 linked · closed']],
      sig: [['911 CALL', 'Two-vehicle collision · injuries · 5th & Main'], ['CAM-5M-02', 'Lane blockage · injured occupants · 0.94']], risk: 'Two lanes blocked · 2 injured · peak flow · HIGH',
      cams: { ids: ['CAM-5M-02', 'CAM-5M-04', 'CAM-MAIN-1', 'CAM-ED'], imgs: ['cc-live-ops.webp', 'cc-sa-hero.webp', 'cc-911-dispatch.webp', 'cc-sa-cop.webp'], hit: 'COLLISION 0.94' },
      unit: 'AMB M-04', units: [['AMB M-04', 'EMS', 'AVAILABLE', '4 min'], ['TRAFFIC T-11', 'Police', 'AVAILABLE', '3 min'], ['PATROL P-07', 'Police', 'ON CALL', '6 min'], ['ENGINE E-3', 'Fire', 'AVAILABLE', '5 min'], ['TOW T-2', 'Contract', 'STANDBY', '12 min']],
      rec: 'Dispatch Ambulance M-04 and Traffic Response T-11. Initiate lane-diversion SOP-TR-04 on 5th & Main; pre-alert Mercy ED for two casualties.', ev: ['911 CALL', 'CAM-5M-02', 'SOP-TR-04', '5 precedents'], conf: 92, approver: 'J. WALSH · DISPATCHER',
      sop: { name: 'SOP-TR-04', desc: 'Road collision · injuries · lane diversion', steps: ['Confirm caller account with camera', 'Dispatch EMS and traffic unit', 'Divert lanes · signal plan 4', 'Pre-alert receiving hospital', 'Scene clear · reopen lanes'] },
      agencies: ['EMS', 'Police', 'Traffic control', 'Fire', 'Mercy Hospital ED'], pre: 2, resolved: 'LANES REOPENED · 19:12',
      map: { kind: 'city', title: 'Live map · 5th & Main', inc: [380, 234], site: { x: 335, y: 190, w: 90, h: 88, l: '5TH & MAIN', s: 'COLLISION' }, streets: ['5TH AVE', 'MAIN ST'], zones: ['BEAT 1', 'BEAT 2', 'BEAT 3', 'BEAT 5'], nosite: true,
        units: [{ id: 'AMB M-04', x: 575, y: 340, c: 'a' }, { id: 'TRAFFIC T-11', x: 120, y: 90, c: 'p' }, { id: 'ENGINE E-3', x: 110, y: 346, c: 'e' }], route: 'M575 340 L575 292 L445 292 L445 234 L398 234', target: { x: 398, y: 234, l: 'SCENE' },
        st: ['911 CALL · 5TH & MAIN', '2 SIGNALS · INC-2025-0841', 'SEVERITY HIGH · SOP-TR-04', 'ROUTE PROPOSED · 4 MIN', 'APPROVED · DISPATCHING', 'AMB M-04 EN ROUTE', 'LANES REOPENED · 19:12'] },
      images: [['cc-911-dispatch.webp', '911 call-taking', 'NENA I3 · NG911', 'r', '48%', '42%'], ['cc-cad-rms.webp', 'CAD ↔ RMS bridge', 'CASE LINKING', 'hl', '52%', '30%', '40%', '38%'], ['cc-ai-dispatch.webp', 'AI dispatch', 'INC-2025-0841 · 0.92', 'hl', '4%', '52%', '92%', '22%'], ['cc-multi-agency.webp', 'Multi-agency coordination', 'POLICE · FIRE · EMS · MUNICIPAL', 'r', '30%', '58%'], ['cc-live-ops.webp', 'Live operations', 'INCIDENTS · UNITS', 'r', '43%', '32%'], ['cc-after-action.webp', 'After-action report', 'SAME SHIFT', 'run']],
      cap: ['A 911 call reports a two-vehicle collision with injuries at 5th & Main. The call is opened as an incident while the caller is still on the line.', 'CAM-5M-02 confirms lane blockage and injured occupants. Two independent signals agree — INC-2025-0841 is verified.', 'Severity is set from injuries, lane blockage and peak flow. SOP-TR-04 is attached; traffic control is alerted.', 'The agent proposes EMS plus a traffic unit, a lane diversion and a hospital pre-alert — with the evidence cited.', 'The dispatcher approves. Identity, time and reasoning go to the ledger before any unit moves.', 'Ambulance M-04 rolls; five agencies are notified in 9 s. The CAD and RMS stay in sync automatically.', 'Lanes reopened. The after-action report is assembled from the record — nothing retyped.'] },

    { id: 'def', t: 'Defense & intelligence', short: 'Defense', page: 'cc-defense.html', pt: 'Defense & Intelligence',
      inc: { id: 'TRK-2291', title: 'Unidentified surface track', where: 'Sector 3 · exclusion zone', sev: 'HIGH' },
      baseline: [['18:32:50', 'AIS', '212 tracks · all correlated'], ['18:33:40', 'RADAR', 'Coastal net · 4 sites nominal'], ['18:34:30', 'ISR', 'UAV ISR-2 on station · 6 h endurance'], ['18:35:20', 'COALITION', 'Coalition cell · 3 partners online']],
      sig: [['RADAR-N2', 'New track · 14 kt · no AIS · Sector 3'], ['EO/IR-1', 'Vessel class confirmed · 0.88']], risk: 'Zone breach in 11 min · critical asset · HIGH',
      cams: { ids: ['EO/IR-1', 'ISR-2 FMV', 'COAST-N2', 'PORT-S'], imgs: ['cc-dfx-mission.webp', 'cc-po-hero.webp', 'cc-dfx-coalition.webp', 'cc-sa-hero.webp'], hit: 'VESSEL 0.88' },
      unit: 'PATROL P-31', units: [['PATROL P-31', 'Naval', 'AVAILABLE', '9 min'], ['UAV ISR-2', 'ISR', 'ON STATION', '2 min'], ['HELO H-1', 'Air', 'READY', '14 min'], ['COAST CS-4', 'Station', 'TRACKING', '—'], ['LIAISON', 'Coalition', 'ONLINE', '—']],
      rec: 'Task UAV ISR-2 to shadow TRK-2291 and vector Patrol P-31 to the intercept line. Hail on channel 16; brief the coalition cell.', ev: ['RADAR-N2', 'EO/IR-1', 'SOP-MAR-7', 'ROE 4.2'], conf: 88, approver: 'CDR M. AL-KAABI · WATCH OFFICER',
      sop: { name: 'SOP-MAR-7', desc: 'Unidentified track · exclusion zone', steps: ['Correlate radar and EO/IR', 'Task ISR shadow', 'Vector patrol to intercept line', 'Hail and identify · channel 16', 'Log outcome · release track'] },
      agencies: ['Naval ops', 'Coast guard', 'Coalition cell', 'Port authority', 'Air control'], pre: 2, resolved: 'IDENTIFIED · RELEASED · 18:58',
      map: { kind: 'coast', title: 'Mission picture · Sector 3', inc: [455, 118], site: null,
        units: [{ id: 'PATROL P-31', x: 250, y: 330, c: 'p' }, { id: 'UAV ISR-2', x: 560, y: 290, c: 'a' }, { id: 'COAST CS-4', x: 120, y: 120, c: 'e' }], route: 'M250 330 L330 250 L400 170 L432 138', target: { x: 432, y: 138, l: 'INTERCEPT' },
        st: ['NEW TRACK · SECTOR 3', '2 SENSORS · TRK-2291', 'BREACH IN 11 MIN · SOP-MAR-7', 'INTERCEPT PROPOSED · 9 MIN', 'APPROVED · TASKING', 'PATROL P-31 EN ROUTE', 'IDENTIFIED · RELEASED'] },
      images: [['cc-dfx-mission.webp', 'Mission picture', 'ISR FUSION · SECTORS', 'r', '52%', '38%'], ['cc-dfx-coalition.webp', 'Coalition workflows', 'JADC2-ALIGNED', 'hl', '8%', '22%', '84%', '30%'], ['cc-dfx-custody.webp', 'Chain of custody', 'COMMS KIT CK-204', 'hl', '35%', '18%', '60%', '62%'], ['cc-ad-policies.webp', 'Action policies', 'ROE · HUMAN-ONLY GATES', 'hl', '64%', '29%', '31%', '15%'], ['cc-sa-playback.webp', 'Track playback', 'DETECTED · TASKED · RELEASED', 'run'], ['cc-ci-audit.webp', 'Audit & compliance', 'EVERY TASKING SIGNED', 'run']],
      cap: ['Coastal radar N2 reports a new surface track with no AIS in Sector 3, 14 knots, heading for the exclusion zone.', 'EO/IR confirms the vessel class. Two sensors agree — TRK-2291 is verified and the breach clock starts.', 'Time to breach, asset criticality and rules of engagement set the severity. SOP-MAR-7 is attached; the coalition cell is alerted.', 'The agent proposes an ISR shadow, a patrol intercept and a channel-16 hail — with every source and the ROE reference cited.', 'The watch officer approves. Identity, time and ROE clause are written to the ledger before any tasking goes out.', 'Patrol P-31 is under way; five agencies and the coalition cell are briefed in 9 s from one screen.', 'Identified and released. The track, tasking and decision trail are archived under chain of custody.'] },

    { id: 'ci', t: 'Critical infrastructure', short: 'Infrastructure', page: 'cc-critical-infra.html', pt: 'Critical Infrastructure',
      inc: { id: 'INC-CI-0312', title: 'Pressure anomaly', where: 'Pipeline segment S-14 · Pump station 3', sev: 'HIGH' },
      baseline: [['18:33:00', 'SCADA', 'PS-3 · 4 pumps · 72% load'], ['18:33:55', 'TELEMETRY', 'S-14 · 6.8 bar · nominal'], ['18:34:40', 'ACCESS', 'PS-3 perimeter · secure'], ['18:35:25', 'CAM', 'CAM-PS3-02 · healthy']],
      sig: [['PT-14-07', 'Pressure drop 8% in 40 s · S-14'], ['FLOW-14', 'Flow imbalance confirmed · 0.90']], risk: 'Supply to ~12,400 customers · asset critical · HIGH',
      cams: { ids: ['CAM-PS3-02', 'CAM-V14B', 'DRONE D-4', 'CAM-S14-N'], imgs: ['cc-ci-hero.webp', 'cc-ci-field.webp', 'cc-ci-scada.webp', 'cc-po-hero.webp'], hit: 'ANOMALY 0.90' },
      unit: 'FIELD F-2', units: [['FIELD F-2', 'Field', 'AVAILABLE', '11 min'], ['VALVE V-1', 'Valve team', 'AVAILABLE', '8 min'], ['DRONE D-4', 'UAS', 'READY', '3 min'], ['CONTROL CR', 'Control', 'ON DUTY', '—'], ['CONTRACT C-9', 'Contractor', 'ON CALL', '40 min']],
      rec: 'Close valves V-14B and V-14C to isolate segment S-14, hold Pump station 3 at 60%, dispatch Field crew F-2 and launch Drone D-4 for a visual.', ev: ['PT-14-07', 'FLOW-14', 'RUNBOOK PL-3', '2 precedents'], conf: 90, approver: 'S. MOHAMMED · SHIFT SUPERVISOR',
      sop: { name: 'RUNBOOK PL-3', desc: 'Pressure anomaly · isolate & inspect', steps: ['Confirm with second sensor', 'Isolate segment · close valves', 'Hold pump station at 60%', 'Dispatch field crew · drone visual', 'Inspect · restore · close'] },
      agencies: ['Operations control', 'Field ops', 'Environment agency', 'Civil Defence', 'Customer comms'], pre: 0, resolved: 'ISOLATED · RESTORED · 19:20',
      map: { kind: 'plant', title: 'Asset map · Pump station 3 · S-14', inc: [395, 205], site: { x: 330, y: 150, w: 130, h: 110, l: 'PUMP STATION 3', s: 'SEGMENT S-14' },
        units: [{ id: 'FIELD F-2', x: 100, y: 340, c: 'e' }, { id: 'VALVE V-1', x: 560, y: 320, c: 'p' }, { id: 'DRONE D-4', x: 560, y: 80, c: 'a' }], route: 'M100 340 L100 290 L240 290 L240 235 L326 235', target: { x: 326, y: 235, l: 'V-14B' },
        st: ['PRESSURE DROP · S-14', '2 SENSORS · INC-CI-0312', '12,400 CUSTOMERS · PL-3', 'ISOLATION PROPOSED', 'APPROVED · ISOLATING', 'FIELD F-2 EN ROUTE', 'ISOLATED · RESTORED'] },
      images: [['cc-ci-scada.webp', 'SCADA + sensor fusion', 'OPC-UA · MODBUS · MQTT', 'run'], ['cc-ci-runbook.webp', 'Runbook automation', 'PL-3 · 5 STEPS', 'hl', '6%', '22%', '48%', '66%'], ['cc-ci-field.webp', 'Field coordination', 'CREWS · DRONES', 'r', '36%', '52%'], ['cc-ci-impact.webp', 'Risk & impact', '~12,400 CUSTOMERS', 'r', '30%', '52%'], ['cc-ci-audit.webp', 'Audit & compliance', 'EVERY VALVE COMMAND SIGNED', 'run'], ['cc-ci-hero.webp', 'Site digital twin', 'PERIMETER · ASSETS', 'r', '52%', '40%']],
      cap: ['Pressure transmitter PT-14-07 reports an 8 % drop on segment S-14 in 40 seconds.', 'Flow telemetry confirms the imbalance. Two independent sensors agree — INC-CI-0312 is opened.', 'Impact is scored — about 12,400 customers on the segment. Runbook PL-3 is attached; operations control is alerted.', 'The agent proposes isolating S-14, holding the pump station at 60 % and sending a crew plus a drone — every sensor cited.', 'The shift supervisor approves. Valve commands are human-approved actions; the approval is written to the ledger first.', 'Field crew F-2 rolls, valves close under supervision, and the environment agency is notified in the same 9 s.', 'Isolated, inspected, restored. The full runbook trail is ready for the regulator without reconstruction.'] },

    { id: 'po', t: 'Ports & logistics', short: 'Ports', page: 'cc-ports.html', pt: 'Ports & Logistics',
      inc: { id: 'INC-PO-0442', title: 'Fire alarm', where: 'Building 7 · Zone 4 · logistics campus', sev: 'HIGH' },
      baseline: [['18:33:20', 'GATE', 'Gate 3 · 62 trucks/hr · nominal'], ['18:34:00', 'YARD', 'Berth 3 · 4 cranes working'], ['18:34:45', 'DWELL', 'Avg dwell 54 h · −6% wk'], ['18:35:30', 'CAM', 'CAM-B7-01 · healthy']],
      sig: [['FA-B7-04', 'Fire alarm · Building 7 · Zone 4'], ['SD-B7-12', 'Smoke detector confirms · 0.93']], risk: 'Hazmat store adjacent · berth 3 ops · HIGH',
      cams: { ids: ['CAM-B7-01', 'CAM-B7-04', 'CAM-QUAY-3', 'CAM-GATE-3'], imgs: ['cc-ad-port.webp', 'cc-po-yard.webp', 'cc-po-hero.webp', 'cc-po-exception.webp'], hit: 'SMOKE 0.93' },
      unit: 'RESPONSE-12', units: [['RESPONSE-12', 'Port fire', 'AVAILABLE', '3 min'], ['PATROL PP-3', 'Port police', 'AVAILABLE', '2 min'], ['MEDIC M-1', 'EMS', 'ON CALL', '6 min'], ['YARD Y-2', 'Ops', 'ON SHIFT', '1 min'], ['GATE OPS', 'Gate', 'ON SHIFT', '—']],
      rec: 'Dispatch Response-12 from the staging area to Building 7 via Quay Rd. Hold Gate 3 inbound; begin EVAC-2 on Zone 4; pause crane 3.', ev: ['FA-B7-04', 'SD-B7-12', 'EVAC-2', '4 precedents'], conf: 93, approver: 'R. HASSAN · TERMINAL DUTY MANAGER',
      sop: { name: 'EVAC-2', desc: 'Fire alarm · warehouse · hazmat adjacent', steps: ['Confirm alarm with detector', 'Hold gate inbound · pause crane 3', 'Dispatch port fire unit', 'Evacuate Building 7 · Zone 4', 'Field confirmation · resume ops'] },
      agencies: ['Port fire', 'Civil Defence', 'Customs', 'Terminal ops', 'Shipping line'], pre: 3, resolved: 'CONTAINED · OPS RESUMED · 18:52',
      map: { kind: 'port', title: 'Terminal map · Building 7 · Zone 4', inc: [468, 248], site: { x: 420, y: 215, w: 110, h: 66, l: 'BUILDING 7', s: 'ZONE 4' },
        units: [{ id: 'RESPONSE-12', x: 96, y: 330, c: 'e' }, { id: 'PATROL PP-3', x: 590, y: 340, c: 'p' }, { id: 'MEDIC M-1', x: 150, y: 120, c: 'a' }], route: 'M96 330 L96 300 L390 300 L390 262 L414 262', target: { x: 414, y: 262, l: 'B7 · DOOR 2' },
        st: ['ALARM · BUILDING 7', '2 SIGNALS · INC-PO-0442', 'HAZMAT ADJACENT · EVAC-2', 'ROUTE PROPOSED · 3 MIN', 'APPROVED · DISPATCHING', 'RESPONSE-12 EN ROUTE', 'CONTAINED · OPS RESUMED'] },
      images: [['cc-po-yard.webp', 'Yard & gate operations', 'GATE 3 · TRK-7184', 'r', '75%', '44%'], ['cc-po-dwell.webp', 'Dwell & flow', 'BERTH · YARD · GATE', 'hl', '42%', '38%', '30%', '16%'], ['cc-po-exception.webp', 'Exception resolution', 'GATE 3 · LANE 2', 'r', '35%', '48%'], ['cc-po-trace.webp', 'Cargo traceability', 'CT-02 · CHAIN OF EVENTS', 'run'], ['cc-po-integration.webp', 'Connected port systems', 'TOS · GATE · CUSTOMS · CRANES', 'r', '50%', '50%'], ['cc-po-hero.webp', 'Terminal digital twin', 'BERTHS · YARD · GATES', 'r', '48%', '42%']],
      cap: ['A fire alarm fires in Building 7, Zone 4 of the logistics campus — next to the hazmat store.', 'The smoke detector confirms. Two independent signals agree — INC-PO-0442 is opened.', 'Hazmat adjacency and berth 3 operations set the severity. EVAC-2 is attached; terminal ops are alerted.', 'The agent proposes Response-12 from staging via Quay Rd, a gate hold and a crane pause — with the evidence cited.', 'The terminal duty manager approves. The approval is written to the ledger before the unit moves.', 'Response-12 rolls; port fire, civil defence, customs and the shipping line are notified in 9 s.', 'Contained and operations resumed. Gate hold, crane pause and every decision are on the record.'] },

    { id: 've', t: 'Stadium & venue ops', short: 'Venues', page: 'cc-venues.html', pt: 'Stadium & Venue Ops',
      inc: { id: 'INC-VE-0118', title: 'Crowd density', where: 'Gate C concourse · 92% of threshold', sev: 'HIGH' },
      baseline: [['18:33:15', 'INGRESS', '31,040 in · 27,200 to come'], ['18:34:05', 'TRANSIT', 'Metro headway 3 min · nominal'], ['18:34:50', 'GATES', 'Gate A–D · 48 lanes open'], ['18:35:35', 'CAM', 'CAM-C-07 · healthy']],
      sig: [['DENS-C2', 'Density 4.1 p/m² · rising · Gate C'], ['CAM-C-07', 'Crowd compression confirmed · 0.90']], risk: 'Kick-off in 18 min · 58,240 inbound · HIGH',
      cams: { ids: ['CAM-C-07', 'CAM-C-02', 'CAM-D-01', 'CAM-BOWL-3'], imgs: ['cc-ve-security.webp', 'cc-ve-video.webp', 'cc-ve-hero.webp', 'cc-ve-review.webp'], hit: 'DENSITY 0.90' },
      unit: 'STEWARDS S-4', units: [['STEWARDS S-4', 'Venue', 'AVAILABLE', '2 min'], ['MEDICAL M-2', 'EMS', 'AVAILABLE', '3 min'], ['POLICE PL-1', 'Police', 'ON SITE', '1 min'], ['GATE D TEAM', 'Venue', 'ON SHIFT', '—'], ['TRANSPORT', 'Authority', 'ONLINE', '—']],
      rec: 'Open Gate D lanes 5–8 and redirect Section 3/4 flow via the south concourse. Stand up Medical M-2 at Gate C; message the queue.', ev: ['DENS-C2', 'CAM-C-07', 'SOP-CR-2', '6 precedents'], conf: 91, approver: 'L. AHMED · VENUE COMMANDER',
      sop: { name: 'SOP-CR-2', desc: 'Crowd density · redirect flow', steps: ['Confirm density with camera', 'Open additional lanes', 'Redirect flow · message the queue', 'Stand up medical at the gate', 'Density below threshold · close'] },
      agencies: ['Venue ops', 'Police', 'Medical', 'Transport authority', 'Club operations'], pre: 0, resolved: 'BELOW THRESHOLD · 18:49',
      map: { kind: 'venue', title: 'Venue map · Gate C concourse', inc: [512, 205], site: null,
        units: [{ id: 'STEWARDS S-4', x: 150, y: 330, c: 'e' }, { id: 'MEDICAL M-2', x: 170, y: 120, c: 'a' }, { id: 'POLICE PL-1', x: 560, y: 340, c: 'p' }], route: 'M150 330 Q 325 405 505 330 L 505 240', target: { x: 505, y: 240, l: 'GATE C' },
        st: ['DENSITY RISING · GATE C', '2 SIGNALS · INC-VE-0118', 'KICK-OFF 18 MIN · SOP-CR-2', 'REDIRECT PROPOSED', 'APPROVED · REDIRECTING', 'STEWARDS S-4 EN ROUTE', 'BELOW THRESHOLD'] },
      images: [['cc-ve-crowd.webp', 'Crowd flow', 'DENSITY · EGRESS', 'r', '46%', '45%'], ['cc-ve-security.webp', 'Security triage', 'GATE 21 · LANE 2', 'r', '40%', '40%'], ['cc-ve-medical.webp', 'Medical response', 'SECTION 3/4', 'r', '40%', '48%'], ['cc-ve-video.webp', 'Video intelligence', 'EVENT CLIP · TIMELINE', 'run'], ['cc-ve-asset.webp', 'Asset accountability', 'RADIOS · MEDKITS · BARRIERS', 'hl', '62%', '22%', '34%', '58%'], ['cc-ve-command.webp', 'Venue command', 'MATCHDAY OVERVIEW', 'r', '35%', '42%']],
      cap: ['Density sensors on the Gate C concourse report 4.1 people per square metre and rising, 18 minutes before kick-off.', 'CAM-C-07 confirms crowd compression. Two independent signals agree — INC-VE-0118 is opened.', 'Inbound crowd, time to kick-off and precedent set the severity. SOP-CR-2 is attached; venue ops are alerted.', 'The agent proposes extra Gate D lanes, a redirect via the south concourse and medical at Gate C — evidence cited.', 'The venue commander approves. The approval is written to the ledger before a lane opens.', 'Stewards S-4 move; police, medical, transport and the club are notified in 9 s. The queue gets the message.', 'Density back below threshold. The whole sequence is on the record for the event review.'] }
  ];

  /* ───────────── execution layer: actions, tasks, comms, notifications per use case ───────────── */
  var EXEC = {
    city: {
      acts: [['assess', 'BMS · BACnet', 'Smoke-control mode on · Zone 4 HVAC'], ['assess', 'Lifts', 'Recall to ground · Level 2 bank'], ['assess', 'PA', 'Evacuation message · Zone 4, Level 2'], ['assess', 'Access', 'Fire doors released · Zone 4'], ['approve', 'CAD', 'Engine-12 dispatched to Gate 3'], ['approve', 'Traffic', 'Signal pre-emption · Al Salam St'], ['dispatch', 'Signs', '"Avoid Al Salam St" · 3 road signs'], ['dispatch', 'VMS', 'Camera tour follows Engine-12'], ['debrief', 'BMS · BACnet', 'Zone 4 returned to normal mode']],
      tasks: [['Sweep Level 2 · Zone 4', 'Mall security', 'assess', 'dispatch'], ['Hold Gate 3 open for Engine-12', 'Gate officer', 'assess', 'approve'], ['Account for occupants at muster B', 'Floor wardens', 'approve', 'debrief'], ['Confirm alarm source on scene', 'Engine-12', 'dispatch', 'debrief'], ['Reset panel and reopen Zone 4', 'Facilities', 'debrief', '']],
      comms: [['verify', 'radio', 'Mall security → Control', 'Haze by the Zone 4 escalators. Clearing the floor.'], ['assess', 'cast', 'Occupant alert', 'Please leave Level 2 by the nearest exit. Staff will guide you.', ['APP', 'SIGNAGE', 'PA']], ['approve', 'radio', 'Control → Engine-12', 'Engine-12, fire alarm Riverside Mall. Gate 3 via Al Salam St.'], ['dispatch', 'radio', 'Engine-12 → Control', 'Copy. En route, three minutes.'], ['debrief', 'radio', 'Engine-12 → Control', 'On scene. Kitchen extract fire, out. Zone 4 safe.']],
      notifs: [['detect', 'SMK-4-08 · smoke alarm', 'verify', 'Linked to INC-0007'], ['detect', 'Fire panel · Zone 4 pre-alarm', 'assess', 'Acknowledged · facilities'], ['verify', 'CAM-4-12 · haze detected', 'verify', 'Attached as evidence'], ['assess', 'Lift L2-B · recall fault', 'dispatch', 'Work order raised · fixed'], ['dispatch', 'Queue building · Al Salam St', 'debrief', 'Cleared by signal plan'], ['debrief', 'Panel reset requested', 'debrief', 'Closed · facilities']],
      cap: ['A smoke detector fires in Zone 4. The nearest cameras come forward and the alert is owned the moment it lands.', 'Camera vision confirms haze. INC-0007 opens, mall security is already on the radio, and every alert is linked to one incident.', 'Pre-approved actions fire at once — smoke-control mode, lift recall, evacuation message, fire doors released. Tasks are created and assigned.', 'The agent drafts the dispatch with its evidence cited. The dispatcher approves it in one click.', 'Engine-12 rolls with signal pre-emption on its route and is briefed over the radio.', 'Civil Defence gets the live picture, occupants get the alert, tasks move to in progress and every notification is answered.', 'Contained. Tasks closed, alerts addressed, the building back to normal — and the record is already written.'] },
    ps: {
      acts: [['assess', 'CAD', 'Incident card created · priority 1'], ['assess', 'Traffic', 'Signal plan 4 · divert via 5th Ave'], ['assess', 'Signs', '"Collision ahead" · 2 signs on Main St'], ['assess', 'RMS', 'Case pre-populated · INC-2025-0841'], ['approve', 'CAD', 'AMB M-04 and Traffic T-11 dispatched'], ['approve', 'Hospital', 'Pre-alert · Mercy ED · 2 casualties'], ['dispatch', 'Traffic', 'Green wave on the ambulance route'], ['dispatch', 'Contract', 'Tow T-2 requested'], ['debrief', 'Traffic', 'Signal plan restored · lanes reopened']],
      tasks: [['Close lanes and set cones', 'Traffic T-11', 'assess', 'dispatch'], ['Triage two casualties', 'AMB M-04', 'approve', 'debrief'], ['Take witness statements', 'Patrol P-07', 'approve', 'debrief'], ['Recover both vehicles', 'Tow T-2', 'dispatch', 'debrief'], ['File case report to RMS', 'Records', 'debrief', '']],
      comms: [['verify', 'radio', '911 call-taker → Dispatch', 'Caller reports two vehicles, two people hurt, lanes blocked.'], ['assess', 'cast', 'Driver alert', 'Collision at 5th & Main — use Oak St.', ['SIGNS', 'NAV FEED', 'RADIO']], ['approve', 'radio', 'Dispatch → AMB M-04', 'M-04, priority one, 5th and Main, two casualties.'], ['dispatch', 'radio', 'AMB M-04 → Dispatch', 'En route, four minutes.'], ['debrief', 'radio', 'Traffic T-11 → Dispatch', 'Scene clear. Lanes open.']],
      notifs: [['detect', '911 call · 5th & Main', 'verify', 'Linked to INC-2025-0841'], ['detect', 'Duplicate 911 call · same location', 'verify', 'Merged into incident'], ['verify', 'CAM-5M-02 · stopped vehicles', 'verify', 'Attached as evidence'], ['assess', 'Queue building · Main St', 'dispatch', 'Diversion active'], ['dispatch', 'Hospital bed check', 'dispatch', 'Mercy ED accepted'], ['debrief', 'RMS report pending', 'debrief', 'Filed']],
      cap: ['A 911 call reports a two-vehicle collision with injuries. The incident opens while the caller is still on the line.', 'CAM-5M-02 confirms the blockage. A duplicate call is merged automatically — one incident, not two.', 'Pre-approved actions fire at once — incident card, signal plan 4, warning signs, RMS case. Lane closure is tasked to Traffic T-11.', 'The agent proposes EMS plus a traffic unit and a hospital pre-alert, evidence cited. Approved in one click.', 'Ambulance M-04 and Traffic T-11 roll; Mercy ED is pre-alerted automatically.', 'A green wave clears the ambulance route, tow and witness tasks are running, and every alert is answered.', 'Lanes reopened, casualties handed over, report filed from the record — nothing retyped.'] },
    def: {
      acts: [['assess', 'ISR', 'UAV ISR-2 re-tasked to TRK-2291'], ['assess', 'C2', 'Track marked SUSPECT · shared to the COP'], ['assess', 'AIS', 'Interrogation sent to TRK-2291'], ['assess', 'Port', 'Harbour traffic hold · Sector 3'], ['approve', 'Naval', 'Patrol P-31 vectored to the intercept line'], ['approve', 'Radio', 'Channel 16 hail queued'], ['dispatch', 'Coalition', 'Live track shared to coalition cell'], ['dispatch', 'EO/IR', 'Continuous track lock · EO/IR-1'], ['debrief', 'C2', 'Track released · COP updated']],
      tasks: [['Shadow TRK-2291', 'UAV ISR-2', 'assess', 'debrief'], ['Intercept and identify', 'Patrol P-31', 'approve', 'debrief'], ['Hail on channel 16', 'Watch officer', 'approve', 'dispatch'], ['Brief the coalition cell', 'Liaison', 'dispatch', 'debrief'], ['Write the track report', 'Intel analyst', 'debrief', '']],
      comms: [['verify', 'radio', 'Coast CS-4 → Ops', 'Visual on contact. Small craft, no flag.'], ['assess', 'cast', 'Harbour advisory', 'Traffic hold in Sector 3 until further notice.', ['VHF', 'PORT', 'AIS']], ['approve', 'radio', 'Ops → P-31', 'P-31, intercept TRK-2291, bearing zero-four-zero.'], ['dispatch', 'radio', 'P-31 → Ops', 'Copy. Eight minutes to the intercept line.'], ['debrief', 'radio', 'P-31 → Ops', 'Identified — fishing vessel, AIS fault. Escorting clear.']],
      notifs: [['detect', 'RADAR-N2 · new track, no AIS', 'verify', 'Linked to TRK-2291'], ['verify', 'EO/IR-1 · vessel class', 'verify', 'Attached as evidence'], ['assess', 'Breach in 11 min', 'approve', 'Intercept tasked'], ['approve', 'ISR-2 fuel state', 'dispatch', 'Relief UAV scheduled'], ['dispatch', 'Coalition request for track', 'dispatch', 'Shared'], ['debrief', 'Track closure review', 'debrief', 'Signed off']],
      cap: ['Coastal radar reports a new surface track with no AIS, heading for the exclusion zone.', 'EO/IR confirms the vessel class. TRK-2291 is verified and the breach clock starts.', 'Pre-approved actions fire at once — ISR re-tasked, track shared to the COP, AIS interrogation, harbour hold. Tasks are assigned.', 'The agent proposes an intercept and a channel-16 hail with the ROE reference. The watch officer approves in one click.', 'Patrol P-31 is vectored to the intercept line and briefed on the radio.', 'The coalition cell has the live track, the hail goes out, and every alert has an owner.', 'Identified and released. The tasking and decision trail are archived under chain of custody.'] },
    ci: {
      acts: [['assess', 'Telemetry', 'High-rate polling on segment S-14'], ['assess', 'UAS', 'Drone D-4 launched for a visual'], ['assess', 'CMMS', 'Work order WO-4471 created'], ['assess', 'Notify', 'Operations control and field leads alerted'], ['approve', 'SCADA', 'V-14B and V-14C closed · S-14 isolated'], ['approve', 'SCADA', 'Pump station 3 held at 60%'], ['dispatch', 'GIS', 'Affected customers mapped'], ['dispatch', 'Notify', 'Customer supply advisory sent'], ['debrief', 'SCADA', 'Valves reopened · pressure 6.8 bar']],
      tasks: [['Drone visual of S-14', 'Drone D-4', 'assess', 'approve'], ['Isolate segment S-14', 'Valve team V-1', 'approve', 'dispatch'], ['Inspect and repair the joint', 'Field F-2', 'approve', 'debrief'], ['Customer advisory', 'Customer comms', 'dispatch', 'debrief'], ['Notify the regulator', 'Compliance', 'dispatch', 'debrief']],
      comms: [['verify', 'radio', 'Control room → Field', 'Pressure dropping on S-14. Stand by.'], ['assess', 'cast', 'Crew call-out', 'Field F-2 and valve team V-1 to segment S-14.', ['MCPTT', 'SMS', 'APP']], ['approve', 'radio', 'Control room → V-1', 'Close V-14B, then V-14C. Confirm each.'], ['dispatch', 'radio', 'V-1 → Control room', 'Both closed. S-14 isolated.'], ['debrief', 'radio', 'F-2 → Control room', 'Joint repaired. Pressure test passed.']],
      notifs: [['detect', 'PT-14-07 · pressure low', 'verify', 'Linked to INC-CI-0312'], ['detect', 'FLOW-14 · imbalance', 'verify', 'Correlated'], ['assess', 'PS-3 pump 2 · vibration', 'dispatch', 'Work order raised'], ['approve', 'V-14C · slow travel', 'dispatch', 'Confirmed closed'], ['dispatch', 'Customer call · low pressure', 'debrief', 'Answered with advisory'], ['debrief', 'Regulator report due', 'debrief', 'Submitted']],
      cap: ['Pressure transmitter PT-14-07 reports an 8 % drop on segment S-14 in 40 seconds.', 'Flow telemetry confirms the imbalance. INC-CI-0312 opens and crews are put on standby.', 'Pre-approved actions fire at once — high-rate polling, drone launched, work order created, operations alerted.', 'The agent proposes isolating S-14 and holding the pump station. Valve commands stay human — approved in one click.', 'Valves close under supervision, the pump station is held at 60 % and the field crew rolls.', 'Customers get a supply advisory, the regulator is notified, and every alert is answered.', 'Isolated, repaired, restored. The runbook trail is ready for the regulator without reconstruction.'] },
    po: {
      acts: [['assess', 'Gate', 'Gate 3 inbound hold'], ['assess', 'Cranes', 'Crane 3 paused safely'], ['assess', 'PA', 'Evacuation message · Building 7, Zone 4'], ['assess', 'Access', 'Building 7 doors released'], ['approve', 'CAD', 'Response-12 dispatched to door 2'], ['approve', 'Yard', 'Quay Rd cleared of straddle carriers'], ['dispatch', 'TOS', 'Berth 3 vessel ops re-sequenced'], ['dispatch', 'Notify', 'Shipping line advised'], ['debrief', 'Gate', 'Gate 3 reopened · crane 3 resumed']],
      tasks: [['Clear Quay Rd', 'Yard Y-2', 'assess', 'approve'], ['Evacuate Building 7, Zone 4', 'Warehouse wardens', 'assess', 'dispatch'], ['Check the hazmat store', 'Port fire', 'approve', 'debrief'], ['Hold affected containers', 'Customs', 'dispatch', 'debrief'], ['Resume gate and crane ops', 'Terminal ops', 'debrief', '']],
      comms: [['verify', 'radio', 'B7 warden → Control', 'Smoke in the Zone 4 aisle. Evacuating staff.'], ['assess', 'cast', 'Terminal alert', 'Building 7 evacuation — avoid Quay Rd.', ['PA', 'RADIO', 'APP']], ['approve', 'radio', 'Control → Response-12', 'Response-12, Building 7 door 2 via Quay Rd.'], ['dispatch', 'radio', 'Response-12 → Control', 'Copy. Three minutes.'], ['debrief', 'radio', 'Response-12 → Control', 'Fire out — pallet charger. Hazmat store unaffected.']],
      notifs: [['detect', 'FA-B7-04 · fire alarm', 'verify', 'Linked to INC-PO-0442'], ['verify', 'SD-B7-12 · smoke', 'verify', 'Correlated'], ['assess', 'Gate 3 queue building', 'dispatch', 'Trucks re-routed to Gate 2'], ['assess', 'Crane 3 mid-lift', 'approve', 'Load landed safely'], ['dispatch', 'Shipping line ETA query', 'dispatch', 'Answered'], ['debrief', 'Insurance report', 'debrief', 'Filed']],
      cap: ['A fire alarm fires in Building 7, Zone 4 — next to the hazmat store.', 'The smoke detector confirms. INC-PO-0442 opens and the warden is already on the radio.', 'Pre-approved actions fire at once — gate hold, crane 3 paused, evacuation message, doors released. Tasks are created.', 'The agent proposes Response-12 via Quay Rd with the evidence cited. The duty manager approves in one click.', 'Response-12 rolls, Quay Rd is cleared, and the unit is briefed on the radio.', 'Berth ops are re-sequenced, customs and the shipping line are informed, and every alert is answered.', 'Contained, operations resumed — gate hold, crane pause and every decision on the record.'] },
    ve: {
      acts: [['assess', 'VMS', 'Camera tour · Gate C concourse'], ['assess', 'Signs', 'Queue-time signs updated'], ['assess', 'Fan app', '"Gate D is quicker" push sent'], ['assess', 'Staff', 'Stewards S-4 paged to Gate C'], ['approve', 'Gates', 'Gate D lanes 5–8 opened'], ['approve', 'Wayfinding', 'Signs redirect to the south concourse'], ['dispatch', 'Medical', 'First-aid point stood up · Gate C'], ['dispatch', 'Transit', 'Metro advised · hold exit flow'], ['debrief', 'Gates', 'Normal gate configuration restored']],
      tasks: [['Redirect Section 3/4 flow', 'Stewards S-4', 'assess', 'dispatch'], ['Open Gate D lanes 5–8', 'Gate D team', 'approve', 'dispatch'], ['First-aid point at Gate C', 'Medical M-2', 'approve', 'debrief'], ['Watch density to kick-off', 'Venue ops', 'dispatch', 'debrief'], ['Add to the post-event review', 'Venue commander', 'debrief', '']],
      comms: [['verify', 'radio', 'Gate C steward → Control', 'Queue backing up past the barriers.'], ['assess', 'cast', 'Fan message', 'Gate D is quicker — follow the signs.', ['APP', 'SCREENS', 'PA']], ['approve', 'radio', 'Control → Gate D', 'Open lanes five to eight now.'], ['dispatch', 'radio', 'Gate D → Control', 'Lanes open. Flowing.'], ['debrief', 'radio', 'Stewards S-4 → Control', 'Gate C density back to normal.']],
      notifs: [['detect', 'DENS-C2 · density high', 'verify', 'Linked to INC-VE-0118'], ['verify', 'CAM-C-07 · compression', 'verify', 'Attached as evidence'], ['assess', 'Turnstile C4 · fault', 'dispatch', 'Engineer fixed'], ['approve', 'Lost child · Gate C', 'dispatch', 'Reunited with family'], ['dispatch', 'Metro platform crowding', 'debrief', 'Exits held by transit'], ['debrief', 'Density report', 'debrief', 'Filed']],
      cap: ['Density on the Gate C concourse hits 4.1 people per square metre and rising, 18 minutes before kick-off.', 'CAM-C-07 confirms compression. INC-VE-0118 opens and the Gate C steward is on the radio.', 'Pre-approved actions fire at once — camera tour, queue signs, a push to the fan app, stewards paged. Tasks are created.', 'The agent proposes extra Gate D lanes and a redirect, evidence cited. The venue commander approves in one click.', 'Gate D lanes open and the south-concourse wayfinding switches on.', 'Medical stands up at Gate C, transit holds the exits, the queue gets the message, and every alert is answered.', 'Density back below threshold. The whole sequence is on the record for the event review.'] }
  };
  USE.forEach(function (u) { var x = EXEC[u.id]; if (!x) return; u.acts = x.acts; u.tasks = x.tasks; u.comms = x.comms; u.notifs = x.notifs; u.cap = x.cap; u.map.st[2] = 'ACTING · ' + u.sop.name + ' RUNNING'; });
  var STAGE_T = { detect: EL.detect, verify: EL.verify, assess: EL.assess, recommend: EL.recommend, approve: EL.approve, dispatch: EL.dispatch, debrief: EL.debrief };

  function buildActions(el, U, ctl) {
    el.innerHTML = HD('Actions', 'EXECUTING · POLICY-GATED') + '<div class="w-act"><div class="w-act__list"></div><div class="w-act__ft"><span><b class="w-act__n">0</b> executed</span><span><b>0</b> failed</span><span class="w-act__live">LIVE</span></div></div>';
    var list = q('.w-act__list', el), nEl = q('.w-act__n', el), n = 0, tm = [];
    function add(a, k) {
      var r = h('div', 'w-act__row is-run', '<span class="w-act__sys">' + esc(a[1]) + '</span><span class="w-act__x">' + esc(a[2]) + '</span><span class="w-act__st"><i></i><em>RUNNING</em></span>');
      r.setAttribute('data-pol', a[0] === 'assess' || a[0] === 'dispatch' || a[0] === 'debrief' ? 'AUTO · pre-approved policy' : 'APPROVED · ' + U.approver.split('·')[0].trim());
      list.appendChild(r); while (list.children.length > 7) list.removeChild(list.firstChild);
      tm.push(setTimeout(function () { r.className = 'w-act__row is-done'; q('.w-act__st em', r).textContent = ts(STAGE_T[a[0]] + 2 + k * 2); n++; nEl.textContent = n; }, RM ? 0 : 900));
    }
    function reset() { tm.forEach(clearTimeout); tm = []; list.innerHTML = ''; n = 0; nEl.textContent = '0'; }
    el.addEventListener('click', function (e) { var r = e.target.closest('.w-act__row'); if (!r || !inZoom(el)) return; e.stopPropagation(); r.classList.toggle('is-open'); var d = q('.w-act__pol', r); if (!d) { r.appendChild(h('span', 'w-act__pol', esc(r.getAttribute('data-pol')) + ' · written to the ledger')); } });
    var on = {};
    ['assess', 'approve', 'dispatch', 'debrief'].forEach(function (st) { on[st] = function () { var k = 0; U.acts.forEach(function (a) { if (a[0] !== st) return; var kk = k++; tm.push(setTimeout(function () { add(a, kk); }, RM ? 0 : kk * 480)); }); }; });
    return { reset: reset, on: on };
  }

  function buildTasks(el, U) {
    el.innerHTML = HD('Tasks', 'AUTO-CREATED · ASSIGNED') + '<div class="w-tk"><div class="w-tk__list"></div><div class="w-tk__ft"><span>Created <b class="w-tk__c">0</b></span><span>In progress <b class="w-tk__p">0</b></span><span>Done <b class="w-tk__d">0</b></span></div></div>';
    var list = q('.w-tk__list', el), rows = {}, tm = [], doneFlag = {};
    function initials(s) { return s.replace(/[^A-Za-z0-9 ]/g, '').split(' ').filter(Boolean).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase(); }
    function count() { var c = 0, p = 0, d = 0; qa('.w-tk__row', list).forEach(function (r) { c++; if (r.classList.contains('is-done')) d++; else if (r.classList.contains('is-prog')) p++; }); q('.w-tk__c', el).textContent = c; q('.w-tk__p', el).textContent = p; q('.w-tk__d', el).textContent = d; }
    function setSt(r, st) { r.className = 'w-tk__row is-' + st; q('.w-tk__chip', r).textContent = st === 'new' ? 'NEW' : st === 'prog' ? 'IN PROGRESS' : 'DONE'; count(); }
    function create(t, i) {
      var r = h('div', 'w-tk__row is-new', '<i class="w-tk__ck"></i><span class="w-tk__t">' + esc(t[0]) + '</span><span class="w-tk__av" title="' + esc(t[1]) + '">' + initials(t[1]) + '</span><span class="w-tk__o">' + esc(t[1]) + '</span><span class="w-tk__chip">NEW</span>');
      list.appendChild(r); rows[i] = r; count();
      if (doneFlag[i]) { tm.push(setTimeout(function () { setSt(r, 'done'); }, RM ? 0 : 700)); return; }
      tm.push(setTimeout(function () { if (!r.classList.contains('is-done')) setSt(r, 'prog'); }, RM ? 0 : 1300));
    }
    function reset() { tm.forEach(clearTimeout); tm = []; list.innerHTML = ''; rows = {}; doneFlag = {}; count(); }
    el.addEventListener('click', function (e) { var r = e.target.closest('.w-tk__row'); if (!r || !inZoom(el)) return; e.stopPropagation(); setSt(r, r.classList.contains('is-new') ? 'prog' : r.classList.contains('is-prog') ? 'done' : 'prog'); });
    var on = {};
    STAGE_IDS.forEach(function (st) { on[st] = function () {
      var k = 0;
      U.tasks.forEach(function (t, i) { if (t[3] === st) { doneFlag[i] = true; var kk = k++; tm.push(setTimeout(function () { if (rows[i]) setSt(rows[i], 'done'); }, RM ? 0 : 400 + kk * 500)); } });
      U.tasks.forEach(function (t, i) { if (t[2] === st && !rows[i]) { var kk = k++; tm.push(setTimeout(function () { create(t, i); }, RM ? 0 : 300 + kk * 520)); } });
    }; });
    return { reset: reset, on: on };
  }

  function buildComms(el, U) {
    el.innerHTML = HD('Comms', 'MCPTT · SMS · CAD-TO-CAD') + '<div class="w-cm"><div class="w-cm__list"></div><div class="w-cm__ag">' + U.agencies.map(function (a) { return '<span title="' + esc(a) + '"><i></i>' + esc(a.split(' ')[0]) + '</span>'; }).join('') + '</div><div class="w-cm__ft"><span class="w-cm__agn">AGENCIES 0/' + U.agencies.length + '</span><span class="w-btn w-btn--sm" data-act="send">Send update</span><b class="w-cm__agt">—</b></div></div>';
    var list = q('.w-cm__list', el), ags = qa('.w-cm__ag span', el), tm = [];
    function wave() { var o = ''; for (var i = 0; i < 14; i++) o += '<i style="--h:' + (0.25 + ((i * 37) % 11) / 14).toFixed(2) + ';animation-delay:' + (-(i * 0.09)).toFixed(2) + 's"></i>'; return '<span class="w-cm__wave">' + o + '</span>'; }
    function msg(m, sec) {
      var cast = m[1] === 'cast';
      var r = h('div', 'w-cm__msg w-cm__msg--' + m[1], '<div class="w-cm__hd"><span class="w-cm__who">' + (cast ? 'BROADCAST · ' : '') + esc(m[2]) + '</span><span class="w-cm__t">' + ts(sec) + '</span></div><div class="w-cm__txt">' + (m[1] === 'radio' ? wave() : '') + '<span>' + esc(m[3]) + '</span></div>' + (cast ? '<div class="w-cm__ch">' + m[4].map(function (c) { return '<span>' + esc(c) + '</span>'; }).join('') + '</div>' : ''));
      list.appendChild(r); while (list.children.length > 3) list.removeChild(list.firstChild);
      if (cast) qa('.w-cm__ch span', r).forEach(function (c, i) { tm.push(setTimeout(function () { c.classList.add('is-ok'); }, RM ? 0 : 600 + i * 450)); });
      if (m[1] === 'radio') tm.push(setTimeout(function () { r.classList.add('is-said'); }, RM ? 0 : 2200));
    }
    function notifyAgencies() { ags.forEach(function (a, i) { tm.push(setTimeout(function () { a.classList.add('is-ok'); q('.w-cm__agn', el).textContent = 'AGENCIES ' + (i + 1) + '/' + ags.length; }, RM ? 0 : 500 + i * 420)); }); tm.push(setTimeout(function () { q('.w-cm__agt', el).textContent = '9 s'; }, RM ? 0 : 600 + ags.length * 420)); }
    function reset() { tm.forEach(clearTimeout); tm = []; list.innerHTML = ''; ags.forEach(function (a) { a.className = ''; }); q('.w-cm__agn', el).textContent = 'AGENCIES 0/' + ags.length; q('.w-cm__agt', el).textContent = '—'; }
    el.addEventListener('click', function (e) { var b = e.target.closest('[data-act="send"]'); if (!b || !inZoom(el)) return; e.stopPropagation(); msg(['x', 'cast', 'Control → all units', 'Status update: ' + U.inc.id + ' — ' + U.inc.title.toLowerCase() + ', response under way.', ['RADIO', 'SMS', 'APP']], EL.dispatch + 20); if (!ags[0].classList.contains('is-ok')) notifyAgencies(); });
    var on = {};
    STAGE_IDS.forEach(function (st) { on[st] = function () {
      var k = 0; U.comms.forEach(function (m) { if (m[0] !== st) return; var kk = k++; tm.push(setTimeout(function () { msg(m, STAGE_T[st] + 3 + kk * 6); }, RM ? 0 : 250 + kk * 2400)); });
      if (st === 'dispatch' && !ags[0].classList.contains('is-ok')) notifyAgencies();
      if (st === 'debrief') ags.forEach(function (a) { a.classList.add('is-ack'); });
    }; });
    return { reset: reset, on: on };
  }

  function buildNotifs(el, U) {
    el.innerHTML = HD('Notifications', '<span class="w-nt__open">0 OPEN</span> · <span class="w-nt__done">0 ADDRESSED</span>') + '<div class="w-nt"><div class="w-nt__list"></div><div class="w-nt__ft"><i class="w-nt__bar"><b></b></i><span class="w-nt__pct">—</span></div></div>';
    var list = q('.w-nt__list', el), rows = {}, tm = [], pend = {};
    function count() { var o = 0, d = 0; qa('.w-nt__row', list).forEach(function (r) { if (r.classList.contains('is-done')) d++; else o++; }); q('.w-nt__open', el).textContent = o + ' OPEN'; q('.w-nt__done', el).textContent = d + ' ADDRESSED'; var t = o + d; q('.w-nt__bar b', el).style.width = (t ? d / t * 100 : 0) + '%'; q('.w-nt__pct', el).textContent = t ? Math.round(d / t * 100) + '% ADDRESSED' : '—'; el.classList.toggle('is-clear', t > 0 && o === 0); }
    function raise(nf, i) { var r = h('div', 'w-nt__row is-new', '<i class="w-nt__dot"></i><span class="w-nt__x">' + esc(nf[1]) + '</span><span class="w-nt__res">NEW</span>'); list.insertBefore(r, list.firstChild); rows[i] = r; while (list.children.length > 6) list.removeChild(list.lastChild); count(); if (pend[i]) { var txt = pend[i]; tm.push(setTimeout(function () { address(i, txt); }, RM ? 0 : 700)); } }
    function address(i, txt) { var r = rows[i]; if (!r) { pend[i] = txt; return; } if (r.classList.contains('is-done')) return; r.className = 'w-nt__row is-done'; q('.w-nt__res', r).textContent = '✓ ' + txt; count(); }
    function reset() { tm.forEach(clearTimeout); tm = []; list.innerHTML = ''; rows = {}; pend = {}; count(); el.classList.remove('is-clear'); }
    el.addEventListener('click', function (e) { var r = e.target.closest('.w-nt__row.is-new'); if (!r || !inZoom(el)) return; e.stopPropagation(); for (var k in rows) if (rows[k] === r) address(k, 'Acknowledged by you'); });
    var on = {};
    STAGE_IDS.forEach(function (st) { on[st] = function () {
      var k = 0;
      U.notifs.forEach(function (nf, i) { if (nf[0] === st) { var kk = k++; tm.push(setTimeout(function () { raise(nf, i); }, RM ? 0 : 150 + kk * 600)); } });
      U.notifs.forEach(function (nf, i) { if (nf[2] === st) { var kk = k++; tm.push(setTimeout(function () { address(i, nf[3]); }, RM ? 0 : 900 + kk * 650)); } });
    }; });
    return { reset: reset, on: on };
  }

  /* ───────────── screen builders (inner box 320×200; map 650×410) ───────────── */
  var HD = function (label, right) { return '<div class="w-hd"><span class="w-hd__l"><i></i>' + label + '</span><span class="w-hd__r">' + (right || '') + '</span></div>'; };

  function buildFeed(el, U) {
    el.innerHTML = HD('Signal feed', esc(U.inc.where.split('·')[0]).toUpperCase() + ' · 6 SOURCES') + '<div class="w-feed__f"><span class="is-on" data-f="all">ALL</span><span data-f="alert">ALERTS</span><span data-f="ok">SYSTEM</span></div><div class="w-feed"></div>';
    var list = q('.w-feed', el);
    function row(t, tag, txt, cls) { var r = h('div', 'w-feed__row' + (cls ? ' ' + cls : ''), '<span class="w-feed__t">' + t + '</span><span class="w-feed__tag">' + esc(tag) + '</span><span class="w-feed__x">' + esc(txt) + '</span>'); list.insertBefore(r, list.firstChild); while (list.children.length > 9) list.removeChild(list.lastChild); }
    function reset() { list.innerHTML = ''; U.baseline.forEach(function (b) { row(b[0], b[1], b[2]); }); }
    el.addEventListener('click', function (e) { var f = e.target.closest('.w-feed__f span'); if (!f || !inZoom(el)) return; qa('.w-feed__f span', el).forEach(function (x) { x.classList.toggle('is-on', x === f); }); el.setAttribute('data-filter', f.getAttribute('data-f')); e.stopPropagation(); });
    return { reset: reset, on: {
      detect: function () { row(ts(0), U.sig[0][0], U.sig[0][1], 'is-alert'); },
      verify: function () { row(ts(7), U.sig[1][0], U.sig[1][1], 'is-alert'); setTimeout(function () { row(ts(12), 'CORRELATE', '2 signals agree → ' + U.inc.id + ' opened', 'is-ok'); }, 1400); },
      assess: function () { row(ts(24), 'RISK', U.risk, 'is-warn'); },
      dispatch: function () { row(ts(91), 'DISPATCH', U.unit + ' en route', 'is-ok'); },
      debrief: function () { row(ts(104), U.inc.id, U.resolved.split('·')[0].trim() + ' · after-action ready', 'is-ok'); }
    } };
  }

  function buildCams(el, U) {
    el.innerHTML = HD('Camera wall', 'VMS · 4 OF 212') + '<div class="w-cams">' + U.cams.ids.map(function (id, i) {
      return '<div class="w-cam w-cam--' + (i + 1) + '" style="background-image:url(' + ASSETS + U.cams.imgs[i] + ')"><i class="w-cam__scan"></i><span class="w-cam__id">' + esc(id) + '</span><span class="w-cam__rec">REC</span><div class="w-cam__box"><span></span></div></div>';
    }).join('') + '</div>';
    var cams = qa('.w-cam', el);
    function reset() { cams.forEach(function (c) { c.className = c.className.replace(/ is-\w+/g, ''); }); q('.w-cam--2 .w-cam__box span', el).textContent = ''; q('.w-cam--4 .w-cam__box span', el).textContent = ''; }
    el.addEventListener('click', function (e) { var c = e.target.closest('.w-cam'); if (!c || !inZoom(el)) return; var big = c.classList.contains('is-big'); cams.forEach(function (x) { x.classList.remove('is-big'); }); if (!big) c.classList.add('is-big'); e.stopPropagation(); });
    return { reset: reset, on: {
      detect: function () { cams[1].classList.add('is-watch'); },
      verify: function () { cams[1].classList.add('is-hit'); q('.w-cam--2 .w-cam__box span', el).textContent = U.cams.hit; },
      dispatch: function () { setTimeout(function () { cams[3].classList.add('is-track'); q('.w-cam--4 .w-cam__box span', el).textContent = U.unit; }, 2600); },
      debrief: function () { cams[1].classList.remove('is-hit'); cams[1].classList.add('is-clear'); }
    } };
  }

  /* map base layers */
  var MAPW = 650, MAPH = 410;
  function seeded(n) { var s = n; return function () { s = (s * 16807) % 2147483647; return s / 2147483647; }; }
  function baseCity(M) {
    var rnd = seeded(7), o = '';
    for (var x = 55; x < MAPW; x += 65) o += '<line x1="' + x + '" y1="30" x2="' + x + '" y2="' + MAPH + '" class="m-st' + (x === 315 ? ' m-st--av' : '') + '"/>';
    for (var y = 60; y < MAPH; y += 58) o += '<line x1="0" y1="' + y + '" x2="' + MAPW + '" y2="' + y + '" class="m-st' + (y === 234 ? ' m-st--av' : '') + '"/>';
    var S = M.site;
    for (var bx = 55; bx < MAPW - 65; bx += 65) for (var by = 60; by < MAPH - 58; by += 58) {
      if (bx > 360 && by > 250) continue;
      if (S && bx + 65 > S.x && bx < S.x + S.w && by + 58 > S.y && by < S.y + S.h) continue;
      var r = rnd();
      if (r < 0.12) { o += '<rect x="' + (bx + 6) + '" y="' + (by + 6) + '" width="53" height="46" rx="3" class="m-park"/>'; continue; }
      o += '<rect x="' + (bx + 6) + '" y="' + (by + 6) + '" width="53" height="46" rx="2" class="m-bl"/>';
      var n = 2 + Math.floor(rnd() * 4);
      for (var k = 0; k < n; k++) { var w = 10 + rnd() * 18, hh = 8 + rnd() * 16, xx = bx + 9 + rnd() * (47 - w), yy = by + 9 + rnd() * (40 - hh); o += '<rect x="' + xx.toFixed(1) + '" y="' + yy.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + hh.toFixed(1) + '" class="m-bd' + (rnd() < 0.25 ? ' m-bd--lit' : '') + '"/>'; }
    }
    for (var d = 0; d < 26; d++) o += '<circle cx="' + (rnd() * MAPW).toFixed(0) + '" cy="' + (60 + rnd() * (MAPH - 80)).toFixed(0) + '" r="1.2" class="m-dot"/>';
    o += '<path d="M380 410 C 430 340, 520 320, 650 300 L650 410 Z" class="m-river"/>';
    o += lbl(323, 205, M.streets[0], 'm-lab--st', -90) + lbl(8, 230, M.streets[1], 'm-lab--st') + lbl(70, 50, M.zones[0], 'm-lab--dim') + lbl(330, 50, M.zones[1], 'm-lab--dim') + lbl(70, 290, M.zones[2], 'm-lab--dim') + lbl(600, 50, M.zones[3], 'm-lab--dim');
    return o;
  }
  function basePort(M) {
    var rnd = seeded(11), o = '';
    o += '<rect x="0" y="0" width="' + MAPW + '" height="70" class="m-sea"/><line x1="0" y1="70" x2="' + MAPW + '" y2="70" class="m-quay"/>';
    o += lbl(20, 22, 'BERTH 1', 'm-lab--sea') + lbl(240, 22, 'BERTH 2', 'm-lab--sea') + lbl(470, 22, 'BERTH 3', 'm-lab--sea');
    // vessels
    o += '<rect x="30" y="34" width="150" height="26" rx="6" class="m-vessel"/><rect x="470" y="34" width="150" height="26" rx="6" class="m-vessel"/>';
    // cranes
    [90, 140, 520, 570].forEach(function (cx) { o += '<rect x="' + (cx - 3) + '" y="62" width="6" height="26" class="m-crane"/><line x1="' + cx + '" y1="64" x2="' + (cx + (cx < 300 ? -22 : 22)) + '" y2="46" class="m-crane"/>'; });
    // container rows
    for (var row = 0; row < 5; row++) { var y = 100 + row * 36; for (var c = 0; c < 8; c++) { var x = 30 + c * 48; if (x > 400 && y > 200 && y < 290) continue; var cls = ['m-ctr', 'm-ctr m-ctr--b', 'm-ctr m-ctr--c', 'm-ctr m-ctr--d'][Math.floor(rnd() * 4)]; o += '<rect x="' + x + '" y="' + y + '" width="40" height="14" class="' + cls + '"/><rect x="' + x + '" y="' + (y + 16) + '" width="40" height="8" class="' + cls + '" opacity=".6"/>'; } }
    // roads
    o += '<line x1="0" y1="300" x2="' + MAPW + '" y2="300" class="m-st m-st--av"/><line x1="390" y1="90" x2="390" y2="' + MAPH + '" class="m-st m-st--av"/>' + lbl(10, 296, 'QUAY RD', 'm-lab--st') + lbl(398, 120, 'YARD RD', 'm-lab--st', -90);
    // gate & staging
    o += '<rect x="560" y="360" width="70" height="30" rx="3" class="m-bl"/>' + lbl(566, 379, 'GATE 3', 'm-lab--dim') + '<rect x="40" y="345" width="110" height="40" rx="3" class="m-park"/>' + lbl(48, 369, 'FIRE STAGING', 'm-lab--dim');
    // hazmat store
    o += '<rect x="545" y="215" width="70" height="66" rx="3" class="m-haz"/>' + lbl(552, 252, 'HAZMAT', 'm-lab--warn');
    return o;
  }
  function baseVenue(M) {
    var o = '';
    o += '<ellipse cx="325" cy="205" rx="250" ry="165" class="m-conc"/><ellipse cx="325" cy="205" rx="200" ry="125" class="m-bowl"/><ellipse cx="325" cy="205" rx="130" ry="80" class="m-bowl2"/><rect x="255" y="160" width="140" height="90" rx="6" class="m-pitch"/>';
    o += '<path d="M325 40 L325 370" class="m-st"/><path d="M75 205 L575 205" class="m-st"/>';
    [[325, 40, 'GATE A'], [325, 372, 'GATE B'], [575, 205, 'GATE C'], [75, 205, 'GATE D']].forEach(function (g, i) { o += '<rect x="' + (g[0] - 12) + '" y="' + (g[1] - 6) + '" width="24" height="12" rx="2" class="m-gate2' + (i === 2 ? ' m-gate2--hot' : '') + '"/>' + lbl(g[0] + (i === 3 ? -62 : i === 2 ? 16 : -20), g[1] + (i === 0 ? -12 : i === 1 ? 22 : 4), g[2], 'm-lab--dim'); });
    // sections
    [['S1', 240, 110], ['S2', 410, 110], ['S3/4', 470, 208], ['S5', 410, 300], ['S6', 240, 300], ['S7/8', 170, 208]].forEach(function (s) { o += lbl(s[1], s[2], s[0], 'm-lab--dim'); });
    // car parks
    o += '<rect x="20" y="20" width="110" height="60" rx="3" class="m-bl"/>' + lbl(28, 52, 'CAR PARK N', 'm-lab--dim') + '<rect x="520" y="330" width="110" height="60" rx="3" class="m-bl"/>' + lbl(528, 362, 'TRANSIT HUB', 'm-lab--dim') + '<rect x="20" y="330" width="120" height="60" rx="3" class="m-park"/>' + lbl(28, 362, 'MEDICAL BASE', 'm-lab--dim');
    // density heat on Gate C
    o += '<ellipse cx="512" cy="205" rx="50" ry="62" class="m-heat"/>';
    return o;
  }
  function basePlant(M) {
    var rnd = seeded(5), o = '';
    o += '<rect x="20" y="40" width="610" height="350" rx="6" class="m-fence"/>' + lbl(28, 34, 'PERIMETER · SECURE', 'm-lab--dim');
    // pipelines
    o += '<path d="M40 235 L330 235" class="m-pipe"/><path d="M460 235 L620 235" class="m-pipe"/><path d="M395 260 L395 380" class="m-pipe"/><path d="M40 120 L230 120 L230 235" class="m-pipe m-pipe--thin"/>';
    o += lbl(60, 228, 'SEGMENT S-13', 'm-lab--st') + lbl(470, 228, 'SEGMENT S-14', 'm-lab--st') + lbl(402, 330, 'S-15', 'm-lab--st');
    // valves
    [[326, 235, 'V-14B'], [464, 235, 'V-14C'], [395, 265, 'V-15A']].forEach(function (v) { o += '<rect x="' + (v[0] - 6) + '" y="' + (v[1] - 6) + '" width="12" height="12" rx="2" class="m-valve" transform="rotate(45 ' + v[0] + ' ' + v[1] + ')"/>' + lbl(v[0] - 16, v[1] + 20, v[2], 'm-lab--dim'); });
    // tanks & transformers
    [[100, 90], [150, 90], [200, 90]].forEach(function (t) { o += '<circle cx="' + t[0] + '" cy="' + t[1] + '" r="18" class="m-tank"/>'; }); o += lbl(84, 128, 'TANK FARM', 'm-lab--dim');
    [[520, 90], [570, 90]].forEach(function (t) { o += '<rect x="' + (t[0] - 16) + '" y="' + (t[1] - 14) + '" width="32" height="28" rx="2" class="m-tank"/>'; }); o += lbl(508, 128, 'SUBSTATION', 'm-lab--dim');
    for (var d = 0; d < 14; d++) o += '<circle cx="' + (40 + rnd() * 570).toFixed(0) + '" cy="' + (50 + rnd() * 330).toFixed(0) + '" r="1.4" class="m-dot"/>';
    // sensors on S-14
    o += '<circle cx="360" cy="235" r="4" class="m-sensor"/><circle cx="430" cy="235" r="4" class="m-sensor"/>' + lbl(348, 222, 'PT-14-07', 'm-lab--dim') + lbl(420, 222, 'FLOW-14', 'm-lab--dim');
    return o;
  }
  function baseCoast(M) {
    var rnd = seeded(3), o = '';
    o += '<rect width="' + MAPW + '" height="' + MAPH + '" class="m-sea"/><path d="M0 410 L0 250 C 80 230, 120 300, 220 280 C 300 265, 330 330, 420 330 C 520 330, 560 400, 650 380 L650 410 Z" class="m-land"/>';
    // range rings
    [80, 160, 240].forEach(function (r) { o += '<circle cx="120" cy="120" r="' + r + '" class="m-ring"/>'; }); o += lbl(96, 100, 'COAST N2', 'm-lab--dim');
    // exclusion zone
    o += '<path d="M520 60 A140 140 0 0 1 560 300 L400 210 Z" class="m-excl"/>' + lbl(500, 140, 'EXCLUSION ZONE', 'm-lab--warn') + lbl(60, 40, 'SECTOR 2', 'm-lab--dim') + lbl(330, 40, 'SECTOR 3', 'm-lab--dim') + lbl(540, 380, 'NAVAL BASE', 'm-lab--dim');
    // AIS tracks
    for (var i = 0; i < 9; i++) { var x = 40 + rnd() * 560, y = 30 + rnd() * 200; o += '<path d="M' + x.toFixed(0) + ' ' + y.toFixed(0) + ' l 6 3 l -6 3 z" class="m-ais"/>'; }
    // unidentified track history
    o += '<path d="M640 40 L560 82 L455 118" class="m-trk"/>';
    o += '<rect x="510" y="335" width="90" height="40" rx="3" class="m-bl"/>';
    return o;
  }
  function lbl(x, y, t, cls, rot) { return '<g transform="translate(' + x + ' ' + y + ')' + (rot ? ' rotate(' + rot + ')' : '') + '"><text class="m-lab ' + (cls || '') + '">' + esc(t) + '</text></g>'; }
  var BASES = { city: baseCity, port: basePort, venue: baseVenue, plant: basePlant, coast: baseCoast };

  function buildMap(el, U) {
    var M = U.map; el.classList.add('scr__in--svg');
    var base = BASES[M.kind](M), S = M.site;
    var site = S ? '<rect x="' + S.x + '" y="' + S.y + '" width="' + S.w + '" height="' + S.h + '" rx="3" class="m-mall"/>' + lbl(S.x + S.w / 2, S.y + S.h - 6, S.l, 'm-lab--c') + lbl(S.x + S.w / 2, S.y + 12, S.s, 'm-lab--dim m-lab--c') : '';
    var units = M.units.map(function (u, i) { return '<g class="m-unit m-unit--' + u.c + (i === 0 ? ' m-unit--first' : '') + '" data-unit="' + i + '"><g transform="translate(' + u.x + ' ' + u.y + ')"><circle r="12" class="m-unit__hit"/><circle r="' + (i === 0 ? 7 : 6) + '"/><text y="-12" text-anchor="middle">' + esc(u.id) + '</text></g></g>'; }).join('');
    el.innerHTML = HD(esc(M.title), '<span class="w-lay">LAYERS <b>8</b></span> <span class="w-ping">' + esc(U.inc.id) + '</span>') +
      '<svg class="w-map" viewBox="0 0 ' + MAPW + ' ' + MAPH + '" xmlns="http://www.w3.org/2000/svg">' +
      '<defs><radialGradient id="mGlow" r="0.5"><stop offset="0" stop-color="#7dd3fc" stop-opacity=".25"/><stop offset="1" stop-color="#7dd3fc" stop-opacity="0"/></radialGradient></defs>' +
      '<rect width="' + MAPW + '" height="' + MAPH + '" fill="#06101f"/>' +
      '<g class="m-l m-l--base">' + base + '</g>' +
      '<g class="m-l m-l--zones">' + site + '</g>' +
      '<g class="m-sweep"><path d="M325 205 L325 -20 A225 225 0 0 1 480 40 Z" fill="url(#mGlow)"/></g>' +
      '<g class="m-l m-l--route"><path d="' + M.route + '" class="m-route"/></g>' +
      '<g class="m-inc" data-inc="1" transform="translate(' + M.inc[0] + ' ' + M.inc[1] + ')"><circle r="26" class="m-inc__r1"/><circle r="14" class="m-inc__r2"/><circle r="5" class="m-inc__c"/><text x="32" y="3" class="m-lab m-lab--inc">' + esc(U.sig[0][0]) + '</text></g>' +
      '<g class="m-l m-l--units">' + units + '</g>' +
      '<g class="m-mover" opacity="0"><circle r="7" class="m-mover__c"/><circle r="14" class="m-mover__h"/><animateMotion class="m-motion" dur="6.2s" begin="indefinite" fill="freeze" path="' + M.route + '"/></g>' +
      '<g class="m-gate" transform="translate(' + M.target.x + ' ' + M.target.y + ')"><rect x="-4" y="-4" width="8" height="8" rx="1"/><g transform="translate(10 4)"><text>' + esc(M.target.l) + '</text></g></g>' +
      '</svg><div class="w-map__st"><span class="w-map__k">STATUS</span><span class="w-map__v">MONITORING</span></div>' +
      '<div class="w-map__tools"><span class="is-on" data-l="units">Units</span><span class="is-on" data-l="zones">Zones</span><span class="is-on" data-l="route">Route</span><span class="is-on" data-l="base">Basemap</span></div><div class="w-map__card"></div>';
    var svg = q('svg', el), st = q('.w-map__v', el), mover = q('.m-mover', el), motion = q('.m-motion', el), unitE = q('.m-unit--first', el), card = q('.w-map__card', el), stageIx = -1;
    function set(i, cls) { stageIx = i; svg.className.baseVal = 'w-map ' + cls; st.textContent = M.st[i]; }
    function reset() { stageIx = -1; svg.className.baseVal = 'w-map'; st.textContent = 'MONITORING'; mover.setAttribute('opacity', '0'); unitE.style.opacity = 1; card.className = 'w-map__card'; try { motion.endElement(); } catch (e) {} }
    el.addEventListener('click', function (e) {
      if (!inZoom(el)) return;
      var t = e.target.closest('.w-map__tools span'); if (t) { t.classList.toggle('is-on'); var g = q('.m-l--' + t.getAttribute('data-l'), el); if (g) g.style.display = t.classList.contains('is-on') ? '' : 'none'; e.stopPropagation(); return; }
      var u = e.target.closest('.m-unit'); if (u) { var d = M.units[+u.getAttribute('data-unit')], row = U.units[+u.getAttribute('data-unit')] || U.units[0]; card.innerHTML = '<b>' + esc(d.id) + '</b><span>' + esc(row[1]) + ' · ' + esc(row[2]) + ' · ETA ' + esc(row[3]) + '</span><em>Click Approve on the agent screen to dispatch</em>'; card.className = 'w-map__card is-in'; e.stopPropagation(); return; }
      var inc = e.target.closest('.m-inc'); if (inc) { card.innerHTML = '<b>' + esc(U.inc.id) + ' · ' + esc(U.inc.title) + '</b><span>' + esc(U.inc.where) + '</span><em>' + esc(U.sig[0][0]) + ' · ' + esc(U.sig[0][1]) + (stageIx >= 1 ? ' — ' + esc(U.sig[1][0]) + ' confirmed' : '') + '</em>'; card.className = 'w-map__card is-in'; e.stopPropagation(); return; }
      if (card.classList.contains('is-in')) { card.className = 'w-map__card'; e.stopPropagation(); }
    });
    var on = {};
    ['is-detect', 'is-verify', 'is-assess', 'is-recommend', 'is-approve', 'is-dispatch', 'is-debrief'].forEach(function (cls, i) { on[STAGE_IDS[i]] = function () { set(i, cls); if (i === 5) { mover.setAttribute('opacity', '1'); unitE.style.opacity = 0.25; try { motion.beginElement(); } catch (e) {} } }; });
    return { reset: reset, on: on };
  }

  function buildAI(el, U, ctl) {
    el.innerHTML = HD('Agent · recommendation', 'MODEL v2.4') +
      '<div class="w-ai"><div class="w-ai__inc"><b>' + esc(U.inc.id) + '</b> ' + esc(U.inc.title) + ' · ' + esc(U.inc.where) + ' <span class="w-sev">' + esc(U.inc.sev) + '</span></div>' +
      '<div class="w-ai__txt"><span class="w-ai__type"></span><i class="w-ai__cur"></i></div>' +
      '<div class="w-ai__ev">' + U.ev.map(function (e) { return '<span>' + esc(e) + '</span>'; }).join('') + '</div>' +
      '<div class="w-ai__conf"><span class="w-ai__ck">CONFIDENCE</span><i class="w-ai__bar"><b></b></i><span class="w-ai__cv">—</span></div>' +
      '<div class="w-ai__btns"><span class="w-btn w-btn--ok" data-act="approve">Approve &amp; execute</span><span class="w-btn" data-act="escalate">Escalate</span></div>' +
      '<div class="w-ai__auto">' + U.acts.filter(function (a) { return a[0] === 'assess'; }).length + ' ACTIONS ALREADY EXECUTED UNDER POLICY</div><div class="w-ai__stamp">APPROVED IN ONE CLICK · ' + esc(U.approver) + ' · ' + ts(EL.approve) + '</div><div class="w-ai__esc">ESCALATED TO SHIFT SUPERVISOR · ' + ts(EL.approve - 8) + ' · awaiting co-sign</div></div>';
    var box = q('.w-ai', el), typeEl = q('.w-ai__type', el), bar = q('.w-ai__bar b', el), cv = q('.w-ai__cv', el), timer = null, iv = null;
    function type(i) { typeEl.textContent = U.rec.slice(0, i); if (i < U.rec.length) timer = setTimeout(function () { type(i + 1); }, RM ? 0 : 22); }
    function reset() { clearTimeout(timer); clearInterval(iv); box.className = 'w-ai'; typeEl.textContent = ''; bar.style.width = '0%'; cv.textContent = '—'; }
    el.addEventListener('click', function (e) { var b = e.target.closest('[data-act]'); if (!b || !inZoom(el)) return; e.stopPropagation(); if (!box.classList.contains('is-draft')) { ctl.jump('recommend'); return; } if (b.getAttribute('data-act') === 'approve') { if (!box.classList.contains('is-approved')) ctl.jump('approve'); } else { box.classList.add('is-esc'); } });
    return { reset: reset, on: {
      detect: function () { box.className = 'w-ai is-listen'; typeEl.textContent = ''; },
      assess: function () { box.className = 'w-ai is-think is-auto'; },
      recommend: function () { box.className = 'w-ai is-draft is-auto'; clearTimeout(timer); type(0); var n = 0; clearInterval(iv); iv = setInterval(function () { n += 4; if (n >= U.conf) { n = U.conf; clearInterval(iv); } bar.style.width = n + '%'; cv.textContent = '0.' + n; }, RM ? 0 : 60); },
      approve: function () { clearTimeout(timer); typeEl.textContent = U.rec; clearInterval(iv); bar.style.width = U.conf + '%'; cv.textContent = '0.' + U.conf; box.className = 'w-ai is-draft is-auto is-approved'; },
      debrief: function () { box.className = 'w-ai is-draft is-auto is-approved is-closed'; }
    } };
  }

  function buildSOP(el, U) {
    el.innerHTML = HD('SOP match', '214 PROCEDURES') + '<div class="w-sop"><div class="w-sop__search"><i></i>Searching procedures…</div><div class="w-sop__hit"><b>' + esc(U.sop.name) + '</b> ' + esc(U.sop.desc) + '</div><ol class="w-sop__steps">' + U.sop.steps.map(function (s) { return '<li><i></i>' + esc(s) + '</li>'; }).join('') + '</ol></div>';
    var box = q('.w-sop', el), li = qa('li', el);
    function tick(i) { if (li[i]) li[i].classList.add('is-done'); }
    function reset() { box.className = 'w-sop'; li.forEach(function (l) { l.className = ''; }); }
    el.addEventListener('click', function (e) { var l = e.target.closest('li'); if (!l || !inZoom(el)) return; l.classList.toggle('is-done'); e.stopPropagation(); });
    return { reset: reset, on: {
      detect: function () { box.className = 'w-sop is-search'; },
      assess: function () { box.className = 'w-sop is-match'; setTimeout(function () { tick(0); }, 900); },
      dispatch: function () { tick(1); setTimeout(function () { tick(2); }, 1200); setTimeout(function () { tick(3); }, 4200); },
      debrief: function () { tick(4); box.classList.add('is-complete'); }
    } };
  }

  function buildLedger(el, U) {
    el.innerHTML = HD('Audit ledger', 'APPEND-ONLY · SHA-256') + '<div class="w-led"><div class="w-led__list"></div><div class="w-led__detail"></div><div class="w-led__ft"><span class="w-led__n">0417 entries</span><span class="w-led__verify" data-act="verify">VERIFY CHAIN</span><span class="w-led__ok">CHAIN VERIFIED · 0 GAPS</span></div></div>';
    var list = q('.w-led__list', el), box = q('.w-led', el), detail = q('.w-led__detail', el), n = 417, prev = hash(416);
    function add(kind, who, sec) { n++; var hx = hash(n); var r = h('div', 'w-led__row', '<span class="w-led__i">#' + n + '</span><span class="w-led__h">' + hx.slice(0, 4) + '…' + hx.slice(12) + '</span><span class="w-led__k">' + esc(kind) + '</span><span class="w-led__w">' + esc(who) + '</span><span class="w-led__t">' + ts(sec) + '</span>'); r.setAttribute('data-h', hx); r.setAttribute('data-p', prev); prev = hx; list.appendChild(r); while (list.children.length > 6) list.removeChild(list.firstChild); q('.w-led__n', el).textContent = n + ' entries'; }
    function reset() { list.innerHTML = ''; n = 417; prev = hash(416); box.className = 'w-led'; detail.className = 'w-led__detail'; add('HEARTBEAT', 'system', -140); add('SIGNAL', U.baseline[3][1] + ' · ' + U.baseline[3][2].split('·')[0].trim(), -70); }
    el.addEventListener('click', function (e) { if (!inZoom(el)) return; var v = e.target.closest('[data-act="verify"]'); if (v) { box.classList.add('is-verifying'); setTimeout(function () { box.classList.remove('is-verifying'); box.classList.add('is-verified'); }, 1400); e.stopPropagation(); return; } var r = e.target.closest('.w-led__row'); if (r) { qa('.w-led__row', el).forEach(function (x) { x.classList.toggle('is-sel', x === r); }); detail.innerHTML = '<span>ENTRY ' + esc(q('.w-led__i', r).textContent) + ' · ' + esc(q('.w-led__k', r).textContent) + '</span><b>hash</b> ' + r.getAttribute('data-h') + '<br><b>prev</b> ' + r.getAttribute('data-p') + '<br><b>actor</b> ' + esc(q('.w-led__w', r).textContent) + ' · <b>at</b> ' + esc(q('.w-led__t', r).textContent) + ' · signed · immutable'; detail.className = 'w-led__detail is-in'; e.stopPropagation(); return; } if (detail.classList.contains('is-in')) { detail.className = 'w-led__detail'; qa('.w-led__row', el).forEach(function (x) { x.classList.remove('is-sel'); }); e.stopPropagation(); } });
    return { reset: reset, on: {
      detect: function () { add('SIGNAL', U.sig[0][0], 0); },
      verify: function () { add('SIGNAL', U.sig[1][0], 7); setTimeout(function () { add('INCIDENT', 'correlator', 12); }, 1400); },
      assess: function () { add('ACTIONS', 'policy AUTO · ' + U.acts.filter(function (a) { return a[0] === 'assess'; }).length + ' executed', EL.assess + 4); add('TASKS', U.tasks.filter(function (t) { return t[2] === 'assess'; }).length + ' created · assigned', EL.assess + 6); },
      recommend: function () { add('RECOMMEND', 'agent v2.4 · 0.' + U.conf, EL.recommend); },
      approve: function () { add('APPROVAL', U.approver.toLowerCase(), EL.approve); box.classList.add('is-write'); },
      dispatch: function () { add('DISPATCH', U.unit, EL.dispatch); },
      debrief: function () { add('RESOLVE', 'field · confirmed', EL.debrief); box.className = 'w-led is-verified'; }
    } };
  }

  function buildUnits(el, U, ctl) {
    el.innerHTML = HD('Responders', 'ROLE-AWARE DISPATCH') + '<div class="w-un">' + U.units.map(function (u, i) { return '<div class="w-un__row w-un__row--' + i + '" data-i="' + i + '"><span class="w-un__id">' + esc(u[0]) + '</span><span class="w-un__ty">' + esc(u[1]) + '</span><span class="w-un__st">' + esc(u[2]) + '</span><span class="w-un__eta">' + esc(u[3]) + '</span></div>'; }).join('') + '<div class="w-un__act"><span class="w-btn w-btn--ok" data-act="assign">Assign &amp; dispatch selected</span></div></div>';
    var r0 = q('.w-un__row--0', el), st = q('.w-un__st', r0), eta = q('.w-un__eta', r0), iv = null, secs = 178;
    function reset() { clearInterval(iv); r0.className = 'w-un__row w-un__row--0'; st.textContent = U.units[0][2]; eta.textContent = U.units[0][3]; secs = 178; qa('.w-un__row', el).forEach(function (x) { x.classList.remove('is-sel'); }); }
    el.addEventListener('click', function (e) { if (!inZoom(el)) return; var b = e.target.closest('[data-act="assign"]'); if (b) { ctl.jump('dispatch'); e.stopPropagation(); return; } var r = e.target.closest('.w-un__row'); if (r) { qa('.w-un__row', el).forEach(function (x) { x.classList.toggle('is-sel', x === r); }); e.stopPropagation(); } });
    return { reset: reset, on: {
      recommend: function () { r0.className = 'w-un__row w-un__row--0 is-pick'; st.textContent = 'PROPOSED'; },
      approve: function () { st.textContent = 'ASSIGNED'; },
      dispatch: function () { r0.className = 'w-un__row w-un__row--0 is-go'; st.textContent = 'EN ROUTE'; eta.textContent = mmss(secs); clearInterval(iv); iv = setInterval(function () { secs = Math.max(0, secs - 7); eta.textContent = mmss(secs); if (!secs) clearInterval(iv); }, 250); },
      debrief: function () { clearInterval(iv); r0.className = 'w-un__row w-un__row--0 is-scene'; st.textContent = 'ON SCENE'; eta.textContent = '00:00'; }
    } };
  }

  function buildAgencies(el, U, ctl) {
    el.innerHTML = HD('Agency comms', 'MCPTT · SMS · CAD-TO-CAD') + '<div class="w-ag">' + U.agencies.map(function (a) { return '<div class="w-ag__row"><i></i><span class="w-ag__n">' + esc(a) + '</span><span class="w-ag__s">STANDBY</span></div>'; }).join('') + '<div class="w-ag__ft"><span>CROSS-AGENCY NOTIFY</span><span class="w-btn w-btn--sm" data-act="notify">Notify all</span><b>—</b></div></div>';
    var rows = qa('.w-ag__row', el), ft = q('.w-ag__ft b', el), tm = [];
    function reset() { tm.forEach(clearTimeout); tm = []; rows.forEach(function (r) { r.className = 'w-ag__row'; q('.w-ag__s', r).textContent = 'STANDBY'; }); ft.textContent = '—'; }
    function notify() { rows.forEach(function (r, i) { tm.push(setTimeout(function () { r.className = 'w-ag__row is-sent'; q('.w-ag__s', r).textContent = 'NOTIFIED ' + ts(EL.dispatch + 2 + i * 2).slice(3); }, 500 + i * 550)); }); tm.push(setTimeout(function () { ft.textContent = '9 s'; }, 3400)); }
    el.addEventListener('click', function (e) { var b = e.target.closest('[data-act="notify"]'); if (!b || !inZoom(el)) return; e.stopPropagation(); if (rows[0].classList.contains('is-sent')) return; notify(); });
    return { reset: reset, on: {
      assess: function () { var r = rows[U.pre]; r.className = 'w-ag__row is-pre'; q('.w-ag__s', r).textContent = 'ALERTED'; },
      dispatch: function () { if (!rows[0].classList.contains('is-sent')) notify(); },
      debrief: function () { rows.forEach(function (r) { r.classList.add('is-ack'); }); }
    } };
  }

  function buildKPI(el) {
    var R = [['Signal → confirmed incident', 'verify', '12 s'], ['Incident → first recommendation', 'recommend', '38 s'], ['Recommendation → dispatch', 'dispatch', '41 s'], ['Cross-agency notification', 'dispatch', '9 s'], ['After-action report', 'debrief', 'Same shift']];
    el.innerHTML = HD('Response clock', 'MEASURED') + '<div class="w-kpi"><div class="w-kpi__big"><span class="w-kpi__k">T+</span><b class="w-kpi__v">00:00</b><span class="w-kpi__s">SINCE FIRST SIGNAL</span></div><div class="w-kpi__rows">' + R.map(function (r) { return '<div class="w-kpi__row" data-st="' + r[1] + '"><span>' + r[0] + '</span><b>' + r[2] + '</b></div>'; }).join('') + '</div></div>';
    var v = q('.w-kpi__v', el), rows = qa('.w-kpi__row', el), cur = 0, iv = null;
    function roll(to) { clearInterval(iv); iv = setInterval(function () { if (cur >= to) { cur = to; clearInterval(iv); } else cur += Math.max(1, Math.ceil((to - cur) / 12)); v.textContent = mmss(cur); }, 90); }
    function mark(st) { rows.forEach(function (r) { if (r.getAttribute('data-st') === st) r.classList.add('is-on'); }); }
    function reset() { clearInterval(iv); cur = 0; v.textContent = '00:00'; rows.forEach(function (r) { r.className = 'w-kpi__row'; }); }
    var on = {}; Object.keys(EL).forEach(function (k) { on[k] = function () { roll(EL[k]); mark(k); }; });
    return { reset: reset, on: on };
  }

  function buildImage(el, U, ctl, ix) {
    var im = U.images[ix], ov = '';
    if (im[3] === 'r') ov = '<b class="w-ov w-ov--r" style="left:' + im[4] + ';top:' + im[5] + '"></b>';
    else if (im[3] === 'run') ov = '<b class="w-ov w-ov--run" style="left:8%;right:8%;bottom:14%"></b>';
    else if (im[3] === 'hl') ov = '<b class="w-ov w-ov--hl" style="left:' + im[4] + ';top:' + im[5] + ';width:' + im[6] + ';height:' + im[7] + '"></b>';
    el.innerHTML = HD(esc(im[1]), esc(im[2])) + '<div class="w-img"><img src="' + ASSETS + im[0] + '" alt="" loading="lazy" decoding="async"><i class="w-img__scan"></i>' + ov + '<span class="w-img__hint">Move to pan · click to toggle zoom</span></div>';
    var box = q('.w-img', el), img = q('img', box);
    box.addEventListener('mousemove', function (e) { if (!inZoom(el) || !box.classList.contains('is-zoom')) return; var r = box.getBoundingClientRect(); img.style.transformOrigin = ((e.clientX - r.left) / r.width * 100).toFixed(1) + '% ' + ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%'; });
    el.addEventListener('click', function (e) { if (!inZoom(el)) return; box.classList.toggle('is-zoom'); e.stopPropagation(); });
    return { reset: function () { box.classList.remove('is-zoom'); }, on: {} };
  }

  /* ───────────── screen slots ───────────── */
  var SLOTS = [
    { id: 'feed', t: 'Signal feed', k: 'Situational awareness', page: 'cc-situational-awareness.html', pt: 'Situational Awareness', build: buildFeed, d: 'Every sensor, camera, access-control event and system feed arrives on one timeline. Correlation groups independent signals into a single candidate incident instead of six separate alarms.', how: 'Filter the feed with the chips at the top.' },
    { id: 'cams', t: 'Camera wall', k: 'Situational awareness', page: 'cc-situational-awareness.html', pt: 'Situational Awareness', build: buildCams, d: 'ONVIF cameras and VMS streams with edge analytics. When a detector fires, the nearest cameras are pulled forward automatically and vision confirms or rejects the signal.', how: 'Click a camera to bring it forward.' },
    { id: 'map', t: 'Live map', k: 'Situational awareness', page: 'cc-situational-awareness.html', pt: 'Situational Awareness', build: buildMap, w: 650, hh: 410, d: 'The geo-temporal canvas. Incidents, responders, routes, zones and layers on one map — the proposed route is drawn before anyone moves, and the unit is tracked once dispatch is approved.', how: 'Toggle layers at the top right. Click a unit or the incident for details.' },
    { id: 'ai', t: 'Agent recommendation', k: 'Agentic dispatch', page: 'cc-agentic-dispatch.html', pt: 'Agentic Dispatch', build: buildAI, d: 'The agent drafts the next-best action with the evidence it rests on, the matching SOP and a confidence value. Nothing executes until a named operator approves — and the approval is written to the ledger.', how: 'Press Approve to dispatch, or Escalate to hand the decision up.' },
    { id: 'sop', t: 'SOP match', k: 'Operational workflows', page: 'cc-agentic-dispatch.html', pt: 'Agentic Dispatch', build: buildSOP, d: 'The matching standard operating procedure is attached automatically and tracked step by step, so SOP compliance is measured rather than assumed.', how: 'Click a step to mark it done.' },
    { id: 'ledger', t: 'Audit ledger', k: 'Audited & sovereign', page: 'cc-audited-sovereign.html', pt: 'Audited & Sovereign', build: buildLedger, d: 'Append-only, cryptographically chained. Every signal, recommendation, approval and dispatch is written with actor, timestamp and originating evidence — and the chain verifies itself.', how: 'Click an entry to inspect its hash and predecessor. Press Verify chain.' },
    { id: 'units', t: 'Responders', k: 'Agentic dispatch', page: 'cc-agentic-dispatch.html', pt: 'Agentic Dispatch', build: buildUnits, d: 'Role-aware dispatch. Units are ranked by availability and ETA; the chosen unit moves from proposed to assigned to en route, with the ETA counting down on the same screen.', how: 'Select a unit, then Assign & dispatch.' },
    { id: 'actions', t: 'Actions', k: 'Agentic dispatch', page: 'cc-agentic-dispatch.html', pt: 'Agentic Dispatch', build: buildActions, d: 'What the platform actually does. Routine actions run the moment their policy allows — building systems, lifts, PA, signs, gates, traffic signals — and consequential ones run the moment a named operator approves. Each shows its system, its result and its time.', how: 'Click an action to see the policy it ran under.' },
    { id: 'tasks', t: 'Tasks', k: 'Operational workflows', page: 'cc-agentic-dispatch.html', pt: 'Agentic Dispatch', build: buildTasks, d: 'The SOP turns into work the moment an incident opens. Tasks are created, assigned to a named team or unit, tracked through in progress and closed with the incident — nothing is left in someone’s head.', how: 'Click a task to move it along.' },
    { id: 'comms', t: 'Comms', k: 'Multi-agency', page: 'cc-public-safety.html', pt: 'Public Safety & 911', build: buildComms, d: 'Radio, messaging and public alerts from the same screen as the incident. Units are briefed over MCPTT, occupants and the public get the right message on the right channels, and partner agencies receive the live picture CAD-to-CAD.', how: 'Press Send update to broadcast to all units.' },
    { id: 'notifs', t: 'Notifications', k: 'Situational awareness', page: 'cc-situational-awareness.html', pt: 'Situational Awareness', build: buildNotifs, d: 'Every alert gets an owner and an outcome. Duplicates are merged, related alerts are linked to the incident, and the open count runs down to zero — nothing sits unanswered.', how: 'Click an open notification to acknowledge it.' },
    { id: 'kpi', t: 'Response clock', k: 'Benchmarks', page: 'cc-situational-awareness.html', pt: 'Situational Awareness', build: buildKPI, d: 'Each stage is timed against the stopwatch — the indicative benchmarks measured with customers during pilots.', how: '' },
    { id: 'img0', t: '', k: '', build: buildImage, ix: 0 }, { id: 'img1', t: '', k: '', build: buildImage, ix: 1 }, { id: 'img2', t: '', k: '', build: buildImage, ix: 2 }
  ];
  var STAGES = [
    { id: 'detect', t: 'Detect', d: 5200, f: ['feed', 'cams', 'map', 'notifs'] },
    { id: 'verify', t: 'Verify', d: 5600, f: ['cams', 'feed', 'comms', 'notifs'] },
    { id: 'assess', t: 'Act', d: 6400, f: ['actions', 'tasks', 'comms', 'sop'] },
    { id: 'recommend', t: 'Decide', d: 5600, f: ['ai', 'map', 'units', 'img2'] },
    { id: 'approve', t: 'Dispatch', d: 6400, f: ['ai', 'actions', 'comms', 'units'] },
    { id: 'dispatch', t: 'Coordinate', d: 9000, f: ['map', 'comms', 'tasks', 'actions'] },
    { id: 'debrief', t: 'Resolve', d: 8000, f: ['tasks', 'notifs', 'ledger', 'actions'] }
  ];

  /* ───────────── build ───────────── */
  var ROOM = WALL.closest('.cc-room') || document.body;
  var grid = q('.wall__grid', WALL), stepper = q('.wall__steps', WALL), clock = q('.wall__clock', WALL), track = q('.wall__uc-track', ROOM), dots = q('.wall__uc-dots', ROOM);
  stepper.innerHTML = STAGES.map(function (s, i) { return '<span class="wall__step" data-st="' + s.id + '"><i>' + (i + 1) + '</i>' + s.t + '</span>'; }).join('');
  var SUB = { city: 'Every sensor, camera and responder on one canvas', ps: 'CAD integration, RMS bridging, multi-agency dispatch', def: 'Coalition workflows and ISR fusion', ci: 'SCADA fusion and supervised runbooks', po: 'Terminals, yards, gates and berths', ve: 'Crowd flow, security and medical response' };
  track.innerHTML = USE.map(function (u, i) { return '<button type="button" class="uc" data-i="' + i + '" tabindex="-1"><span class="uc__n">' + (i < 9 ? '0' : '') + (i + 1) + '</span><span class="uc__t">' + esc(u.t) + '</span><span class="uc__s">' + esc(SUB[u.id] || '') + '</span><span class="uc__bar">' + STAGES.map(function () { return '<i></i>'; }).join('') + '</span></button>'; }).join('');
  dots.innerHTML = USE.map(function (u, i) { return '<button type="button" class="uc-dot" role="tab" data-i="' + i + '" aria-label="' + esc(u.t) + '"></button>'; }).join('');
  var ucItems = qa('.uc', track), ucDots = qa('.uc-dot', dots), ucPrevD = [];
  function place() {
    var n = USE.length;
    ucItems.forEach(function (el, j) {
      var d = ((j - cur) % n + n) % n; if (d > n / 2) d -= n; if (d === n / 2) d = (ucPrevD[j] != null && ucPrevD[j] < 0) ? -d : d;
      var jump = ucPrevD[j] != null && Math.abs(d - ucPrevD[j]) > 1;
      if (jump) el.classList.add('is-jump');
      el.style.setProperty('--d', d); el.setAttribute('data-d', Math.abs(d) > 2 ? 'x' : String(Math.abs(d)));
      el.classList.toggle('is-on', d === 0); el.setAttribute('aria-current', d === 0 ? 'true' : 'false'); el.tabIndex = d === 0 ? 0 : -1;
      if (jump) { void el.offsetWidth; el.classList.remove('is-jump'); }
      ucPrevD[j] = d;
    });
    ucDots.forEach(function (b, j) { b.classList.toggle('is-on', j === cur); b.setAttribute('aria-selected', j === cur ? 'true' : 'false'); });
  }
  function ucProgress(i) { var act = ucItems[cur]; if (!act) return; qa('.uc__bar i', act).forEach(function (seg, k) { seg.className = k < i ? 'is-done' : k === i ? 'is-now' : ''; }); }
  function ucProgressClear() { ucItems.forEach(function (el) { qa('.uc__bar i', el).forEach(function (seg) { seg.className = ''; }); }); }
  var tiles = {}, cur = 0, U = USE[0];
  var CTL = { jump: function (id) { jumpTo(id); } };
  SLOTS.forEach(function (s) {
    var tile = h('div', 'scr scr--' + s.id + (s.w ? ' scr--big' : ''));
    tile.style.setProperty('--iw', s.w || 320); tile.style.setProperty('--ih', s.hh || 200);
    tile.setAttribute('role', 'button'); tile.setAttribute('tabindex', '0'); tile.dataset.id = s.id;
    tile.appendChild(h('div', 'scr__in')); tile.appendChild(h('span', 'scr__tag', ''));
    grid.appendChild(tile); tiles[s.id] = tile;
  });
  function buildAll() { SLOTS.forEach(function (s) { buildOne(s); }); }
  function buildOne(s) { var tile = tiles[s.id], inner = h('div', 'scr__in'); tile.replaceChild(inner, q('.scr__in', tile)); s.api = s.build(inner, U, CTL, s.ix); s.api.reset(); var meta = slotMeta(s); q('.scr__tag', tile).textContent = meta.t; tile.setAttribute('aria-label', meta.t + ' — zoom'); }
  function slotMeta(s) { if (s.ix != null) { var im = U.images[s.ix]; return { t: im[1], k: U.t, page: U.page, pt: U.pt, d: 'An Innfini ' + U.pt + ' screen — ' + im[1].toLowerCase() + ' (' + im[2].toLowerCase() + ').', how: 'Click to toggle zoom, then move the pointer to pan.' }; } return s; }
  function fit() { SLOTS.forEach(function (s) { var t = tiles[s.id]; t.style.setProperty('--s', (t.clientWidth / (s.w || 320)).toFixed(4)); }); }
  // grid sizing: fill the room
  function sizeGrid() {
    var room = q('.wall__chassis', WALL), grid_ = grid; if (!room) return;
    var mq = window.innerWidth;
    if (mq <= 720) { room.style.maxWidth = ''; fit(); return; }
    var cols = mq <= 1180 ? 4 : 6, rows = mq <= 1180 ? 5 : 3, gap = 10, pad = 12;
    var others = 0; qa('.wall__bar, .wall__cap, .wall__ticker', room).forEach(function (e) { others += e.offsetHeight; });
    var availH = Math.max(320, (window.innerHeight - (WALL.getBoundingClientRect().top + window.scrollY > 0 ? 0 : 0)) - others - pad * 2 - q('.wall__uc', ROOM).offsetHeight - 120);
    var rowH = (availH - gap * (rows - 1)) / rows, tileW = rowH * 1.6, w = tileW * cols + gap * (cols - 1) + pad * 2 + 2;
    room.style.maxWidth = Math.max(720, Math.round(w)) + 'px';
    fit();
  }
  buildAll(); sizeGrid(); window.addEventListener('resize', sizeGrid); if (window.ResizeObserver) new ResizeObserver(fit).observe(grid);
  (function tick() { var d = new Date(); clock.textContent = [d.getHours(), d.getMinutes(), d.getSeconds()].map(function (n) { return (n < 10 ? '0' : '') + n; }).join(':'); setTimeout(tick, 1000); })();

  /* ───────────── scenario engine ───────────── */
  var idx = -1, timer = null, running = false, visible = false, loops = 0, manualUntil = 0;
  function setStage(i) {
    idx = i; var st = STAGES[i];
    WALL.setAttribute('data-stage', st.id);
    qa('.wall__step', stepper).forEach(function (e, j) { e.className = 'wall__step' + (j < i ? ' is-done' : j === i ? ' is-now' : ''); });
    SLOTS.forEach(function (s) { tiles[s.id].classList.toggle('is-focus', st.f.indexOf(s.id) >= 0); var fn = s.api.on[st.id]; if (fn) fn(); });
    q('.wall__now', WALL).textContent = st.t; ucProgress(i);
    var cap = q('.wall__cap span', WALL); if (cap) { cap.classList.remove('is-in'); cap.textContent = U.cap[i]; void cap.offsetWidth; cap.classList.add('is-in'); }
  }
  function resetAll() { SLOTS.forEach(function (s) { s.api.reset(); tiles[s.id].classList.remove('is-focus'); }); WALL.removeAttribute('data-stage'); qa('.wall__step', stepper).forEach(function (e) { e.className = 'wall__step'; }); var cap = q('.wall__cap span', WALL); if (cap) { cap.textContent = U.t + ' — ' + U.inc.title + ', ' + U.inc.where + '. Standing by.'; cap.classList.add('is-in'); } q('.wall__now', WALL).textContent = 'Standby'; ucProgressClear(); }
  function next() {
    if (!running) return;
    var i = idx + 1;
    if (i >= STAGES.length) { loops++; if (Date.now() > manualUntil && !zoom) { timer = setTimeout(function () { go(cur + 1, true); }, 1200); return; } WALL.classList.add('is-reset'); timer = setTimeout(function () { resetAll(); WALL.classList.remove('is-reset'); idx = -1; timer = setTimeout(next, 600); }, 900); return; }
    setStage(i); timer = setTimeout(next, RM ? 2500 : STAGES[i].d);
  }
  function start() { if (running) return; running = true; if (idx < 0) resetAll(); timer = setTimeout(next, 900); }
  function stop() { running = false; clearTimeout(timer); }
  function sync() { if (visible && !document.hidden) start(); else stop(); }
  function jumpTo(id) { var target = STAGE_IDS.indexOf(id); if (target < 0) return; manualUntil = Date.now() + 90000; clearTimeout(timer); running = true; for (var k = idx + 1; k <= target; k++) setStage(k); timer = setTimeout(next, STAGES[target].d); }
  if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; sync(); }, { threshold: 0.15 }).observe(WALL); else { visible = true; sync(); }
  document.addEventListener('visibilitychange', sync);

  /* ───────────── use-case slider (infinite) ───────────── */
  var flipping = false;
  function go(i, auto) {
    if (flipping) return; if (!auto) manualUntil = Date.now() + 90000;
    var n = USE.length; i = ((i % n) + n) % n; if (i === cur && !auto) return;
    flipping = true; stop(); closeZoom();
    var dir = i === (cur + 1) % n ? 1 : i === (cur - 1 + n) % n ? -1 : 1; cur = i; U = USE[cur];
    ucProgressClear(); place();
    WALL.setAttribute('data-uc', U.id); WALL.style.setProperty('--dir', dir);
    var order = SLOTS.slice(); order.forEach(function (s, k) { setTimeout(function () { tiles[s.id].classList.add('is-flip'); }, RM ? 0 : k * 35); });
    setTimeout(function () { resetAll(); buildAll(); fit(); order.forEach(function (s, k) { setTimeout(function () { tiles[s.id].classList.remove('is-flip'); }, RM ? 0 : k * 35); }); idx = -1; setTimeout(function () { flipping = false; resetAll(); sync(); }, RM ? 50 : 700); }, RM ? 30 : 380);
  }
  track.addEventListener('click', function (e) { var t = e.target.closest('.uc'); if (t) go(+t.getAttribute('data-i')); });
  dots.addEventListener('click', function (e) { var t = e.target.closest('.uc-dot'); if (t) go(+t.getAttribute('data-i')); });
  track.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { go(cur + 1); e.preventDefault(); } else if (e.key === 'ArrowLeft') { go(cur - 1); e.preventDefault(); } });
  (function swipeTrack() { var x0 = null; track.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true }); track.addEventListener('touchend', function (e) { if (x0 == null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 40) go(cur + (dx < 0 ? 1 : -1)); }, { passive: true }); })();
  qa('[data-uc-prev]', ROOM).forEach(function (b) { b.addEventListener('click', function () { go(cur - 1); }); });
  qa('[data-uc-next]', ROOM).forEach(function (b) { b.addEventListener('click', function () { go(cur + 1); }); });
  WALL.addEventListener('keydown', function (e) { if (zoom) return; if (e.key === 'ArrowRight') { go(cur + 1); e.preventDefault(); } else if (e.key === 'ArrowLeft') { go(cur - 1); e.preventDefault(); } });
  (function swipe() { var x0 = null, y0 = null; grid.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true }); grid.addEventListener('touchend', function (e) { if (x0 == null) return; var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; x0 = null; if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(cur + (dx < 0 ? 1 : -1)); }, { passive: true }); })();
  stepper.addEventListener('click', function (e) { var st = e.target.closest('.wall__step'); if (!st) return; var i = qa('.wall__step', stepper).indexOf(st); manualUntil = Date.now() + 90000; stop(); resetAll(); for (var k = 0; k <= i; k++) setStage(k); running = true; timer = setTimeout(next, 9000); });
  place(); go(0, true);

  /* ───────────── zoom (live screen, interactive) ───────────── */
  var zoom = null, zoomSlot = null;
  function openZoom(id) {
    var s = SLOTS.filter(function (x) { return x.id === id; })[0]; if (!s) return;
    if (zoom) { if (zoomSlot === s) return; swapZoom(s); return; }
    manualUntil = Date.now() + 90000; var m = slotMeta(s);
    zoom = h('div', 'wall-zoom', '<div class="wall-zoom__bd"></div><div class="wall-zoom__card" role="dialog" aria-modal="true"><div class="wall-zoom__hd"><span class="wall-zoom__k"></span><span class="wall-zoom__nav"><button type="button" class="wall-zoom__arrow" data-z="-1" aria-label="Previous screen">‹</button><button type="button" class="wall-zoom__arrow" data-z="1" aria-label="Next screen">›</button><button class="wall-zoom__x" type="button" aria-label="Close">×</button></span></div><div class="wall-zoom__scr"></div><div class="wall-zoom__txt"><h3 class="wall-zoom__t"></h3><p class="wall-zoom__d"></p><p class="wall-zoom__how"></p></div><div class="wall-zoom__btns"><a class="btn btn--primary wall-zoom__open" href="#"></a><button class="btn btn--secondary wall-zoom__close" type="button">Back to the wall</button></div></div>');
    document.body.appendChild(zoom); document.body.classList.add('wall-zoom-open');
    qa('.wall-zoom__x,.wall-zoom__close,.wall-zoom__bd', zoom).forEach(function (b) { b.addEventListener('click', closeZoom); });
    qa('.wall-zoom__arrow', zoom).forEach(function (b) { b.addEventListener('click', function () { var i = SLOTS.indexOf(zoomSlot), n = SLOTS.length; swapZoom(SLOTS[((i + (+b.getAttribute('data-z'))) % n + n) % n]); }); });
    zoom._fit = function () { var holder = q('.wall-zoom__scr', zoom); holder.style.setProperty('--s', (holder.clientWidth / (zoomSlot.w || 320)).toFixed(4)); };
    window.addEventListener('resize', zoom._fit);
    placeZoom(s);
    requestAnimationFrame(function () { zoom.classList.add('is-in'); q('.wall-zoom__x', zoom).focus(); });
  }
  function placeZoom(s) {
    zoomSlot = s; var m = slotMeta(s), holder = q('.wall-zoom__scr', zoom), inner = q('.scr__in', tiles[s.id]);
    holder.style.setProperty('--iw', s.w || 320); holder.style.setProperty('--ih', s.hh || 200); holder.innerHTML = ''; holder.appendChild(inner);
    tiles[s.id].classList.add('is-away');
    q('.wall-zoom__k', zoom).textContent = (m.k || U.t) + ' · ' + U.t; q('.wall-zoom__t', zoom).textContent = m.t; q('.wall-zoom__d', zoom).textContent = m.d; q('.wall-zoom__how', zoom).textContent = m.how || ''; q('.wall-zoom__how', zoom).style.display = m.how ? '' : 'none';
    var a = q('.wall-zoom__open', zoom); a.href = m.page; a.textContent = 'Open ' + m.pt + ' →';
    zoom._fit();
  }
  function returnZoomed() { if (!zoomSlot) return; var inner = q('.scr__in', q('.wall-zoom__scr', zoom)); if (inner) { var tile = tiles[zoomSlot.id]; tile.insertBefore(inner, q('.scr__tag', tile)); tile.classList.remove('is-away'); } zoomSlot = null; }
  function swapZoom(s) { returnZoomed(); placeZoom(s); }
  function closeZoom() { if (!zoom) return; returnZoomed(); window.removeEventListener('resize', zoom._fit); var z = zoom; zoom = null; z.classList.remove('is-in'); document.body.classList.remove('wall-zoom-open'); setTimeout(function () { if (z.parentNode) z.parentNode.removeChild(z); }, 260); }
  grid.addEventListener('click', function (e) { var t = e.target.closest('.scr'); if (t && !flipping) openZoom(t.dataset.id); });
  grid.addEventListener('keydown', function (e) { var t = e.target.closest('.scr'); if (t && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openZoom(t.dataset.id); } });
  document.addEventListener('keydown', function (e) { if (!zoom) return; if (e.key === 'Escape') closeZoom(); else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { var i = SLOTS.indexOf(zoomSlot), n = SLOTS.length; swapZoom(SLOTS[((i + (e.key === 'ArrowRight' ? 1 : -1)) % n + n) % n]); } });

  window.InnoventWall = { go: go, openZoom: openZoom, setStage: setStage, jump: jumpTo, stages: STAGES, uses: USE, stop: stop, start: start, reset: resetAll, current: function () { return cur; } };
})();
