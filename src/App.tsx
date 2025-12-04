import { useState } from 'react'
import './App.css'

type EmployeeProfile = {
  id: string
  name: string
  role: string
  team: string
  yearsAtFC: number
  office: string
  homeCountry: string
  focus: string
  funFact: string
  image: string
}

const employees: EmployeeProfile[] = [
  {
    id: 'amelia-roth',
    name: 'Amelia Roth',
    role: 'Lead Product Designer',
    team: 'Store Experience',
    yearsAtFC: 4,
    office: 'Hamburg',
    homeCountry: 'Germany',
    focus: 'Designing playful onboarding experiments',
    funFact: 'Built the FC design system from a Figma file on a train ride',
    image:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=720&q=80',
  },
  {
    id: 'mateo-silva',
    name: 'Mateo Silva',
    role: 'Senior Data Engineer',
    team: 'Insight Platform',
    yearsAtFC: 3,
    office: 'Lisbon',
    homeCountry: 'Portugal',
    focus: 'Real-time assortment availability signals',
    funFact: 'Knows every rooftop coffee spot near the Lisbon office',
    image:
      'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=720&q=80',
  },
  {
    id: 'mara-choi',
    name: 'Mara Choi',
    role: 'People Partner',
    team: 'People & Culture',
    yearsAtFC: 6,
    office: 'Amsterdam',
    homeCountry: 'South Korea',
    focus: 'Scaling the Fashion Cloud leadership playground',
    funFact: 'Hosts the monthly FC dumpling club',
    image:
      'https://images.unsplash.com/photo-1544723795-432537f5b360?auto=format&fit=crop&w=720&q=80',
  },
  {
    id: 'niko-hernandez',
    name: 'Niko Hernández',
    role: 'Engineering Manager',
    team: 'Partner APIs',
    yearsAtFC: 5,
    office: 'Hamburg',
    homeCountry: 'Colombia',
    focus: 'Latency busting for catalogue syncs',
    funFact: 'Has a custom sneaker for every product launch',
    image:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=720&q=80',
  },
]

function ProfileCard({ employee }: { employee: EmployeeProfile }) {
  const [isFlipped, setIsFlipped] = useState(false)
  const flipCard = () => setIsFlipped((prev) => !prev)

  return (
    <button
      type="button"
      className={`profile-card ${isFlipped ? 'is-flipped' : ''}`}
      onClick={flipCard}
      aria-pressed={isFlipped}
      aria-label={`Flip profile card for ${employee.name}`}
    >
      <div className="card-inner">
        <article className="card-face card-front">

          <div className="front-photo">
            <img
              className="profile-photo"
              src={employee.image}
              alt={`${employee.name} portrait`}
              loading="lazy"
            />
          </div>
        </article>

        <article className="card-face card-back">
          <h3>{employee.name}</h3>
          <table className="profile-details">
            <tbody>
              <tr>
                <td>Home Country</td>
                <td>{employee.homeCountry}</td>
              </tr>
              <tr>
                <td>FC Office</td>
                <td>{employee.office}</td>
              </tr>
              <tr>
                <td>Team</td>
                <td>{employee.team}</td>
              </tr>
              <tr>
                <td>Role</td>
                <td>{employee.role}</td>
              </tr>
              <tr>
                <td>Years @ FC</td>
                <td>{employee.yearsAtFC}</td>
              </tr>
              <tr>
                <td>Fun Fact</td>
                <td>{employee.funFact}</td>
              </tr>
            </tbody>
          </table>
        </article>
      </div >
    </button >
  )
}

function App() {
  return (
    <div className="app-shell">
      <header className="hero">
        <p className="eyebrow">Fashion Cloud Faces</p>
        <h1>Learn the faces that power FC</h1>
        <p className="hero-copy">
          Tap through profiles to match names, teams, and stories. Memorize your
          colleagues so the next hallway hello feels effortless.
        </p>
      </header>

      <section className="cards-grid">
        {employees.map((employee) => (
          <ProfileCard key={employee.id} employee={employee} />
        ))}
      </section>
    </div>
  )
}

export default App
