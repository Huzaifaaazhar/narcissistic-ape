import { StaticPage } from '@/components/layout/StaticPage'

export const metadata = { title: 'Privacy' }

export default function Privacy() {
  return (
    <StaticPage title="Privacy">
      <p>We collect as little as we can and still run a leaderboard.</p>
      <h2 className="label text-[13px] font-bold text-navy">What we keep</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>The nickname, house and campus type you choose when you enrol.</li>
        <li>Your settings (sound, music, haptics, graphics quality).</li>
      </ul>
      <p>Right now both live only in your browser&apos;s local storage on this device. Nothing is sent to our servers yet. When scores go live, your nickname, house and round scores will be stored with an anonymous ID so the leaderboard works.</p>
      <h2 className="label text-[13px] font-bold text-navy">What we never ask for</h2>
      <p>No email, phone number, real name, location, camera or microphone. When the leaderboard goes live, your IP address will be used briefly to stop spam and kept only as a one-way hash.</p>
      <h2 className="label text-[13px] font-bold text-navy">Deleting your data</h2>
      <p>Clear this site&apos;s data in your browser to remove everything stored on this device. Once accounts exist, a &ldquo;Clear my data&rdquo; button in Settings will delete your server records too.</p>
    </StaticPage>
  )
}
