import type { ActionFunction } from '@remix-run/cloudflare';
import { redirect } from '@remix-run/cloudflare';
import { Link, useFetcher, useSearchParams } from '@remix-run/react';
import { signInWithPopup } from 'firebase/auth';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import invariant from 'tiny-invariant';
import { auth, db, googleProvider } from '~/firebase/firebase';
import { getAuth } from '~/firebase/firebase.server';
import { session } from '~/session.server';

export const action: ActionFunction = async ({ request, context }) => {
  const form = await request.formData();
  const idToken = form.get('idToken') as string;
  const redirectTo = form.get('redirectTo') as string;

  invariant(idToken, 'idToken is required');

  // Verify the idToken is actually valid
  await getAuth(context).verifyIdToken(idToken);

  const jwt = await getAuth(context).createSessionCookie(idToken);

  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await session.serialize(jwt, {
        expires: new Date(Date.now() + 60 * 60 * 24 * 14 * 1000),
      }),
    },
  });
};

export default function Login() {
  const fetcher = useFetcher();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';

  const signInWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const user = res.user;
      const q = query(collection(db, 'users'), where('uid', '==', user.uid));
      const docs = await getDocs(q);
      if (docs.docs.length === 0) {
        await addDoc(collection(db, 'users'), {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        });
      }
      fetcher.submit(
        { idToken: await res.user.getIdToken(), redirectTo },
        { method: 'post' }
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="relative min-h-screen space-y-10 flex flex-col">
      <div className="bg-gradient-to-br from-[#818CF8] from-50% to-[#F9B8BB] text-white">
        <header className="">
          <div className="container mx-auto max-w-6xl p-5 flex flex-row justify-between items-center gap-4">
            <Link className="flex flex-row items-center space-x-2" to="/">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                width="30"
                zoomAndPan="magnify"
                viewBox="0 0 375 374.999991"
                height="30"
                preserveAspectRatio="xMidYMid meet"
                version="1.0"
              >
                <defs>
                  <clipPath id="941f7a3cc7">
                    <path
                      d="M 187.5 0 C 83.945312 0 0 83.945312 0 187.5 C 0 291.054688 83.945312 375 187.5 375 C 291.054688 375 375 291.054688 375 187.5 C 375 83.945312 291.054688 0 187.5 0 "
                      clipRule="nonzero"
                    />
                  </clipPath>
                  <linearGradient
                    x1="-4.507404"
                    gradientTransform="matrix(5.859375, 0, 0, 5.859375, 0.0000045, 0)"
                    y1="6.437241"
                    x2="68.507401"
                    gradientUnits="userSpaceOnUse"
                    y2="57.562759"
                    id="ece5086a88"
                  >
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(97.599792%, 72.198486%, 73.298645%)"
                      offset="0"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(97.415161%, 72.131348%, 73.391724%)"
                      offset="0.0078125"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(97.047424%, 71.995544%, 73.579407%)"
                      offset="0.015625"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(96.681213%, 71.861267%, 73.76709%)"
                      offset="0.0234375"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(96.313477%, 71.725464%, 73.954773%)"
                      offset="0.03125"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(95.94574%, 71.591187%, 74.142456%)"
                      offset="0.0390625"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(95.579529%, 71.455383%, 74.330139%)"
                      offset="0.046875"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(95.211792%, 71.31958%, 74.517822%)"
                      offset="0.0546875"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(94.845581%, 71.185303%, 74.705505%)"
                      offset="0.0625"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(94.477844%, 71.0495%, 74.891663%)"
                      offset="0.0703125"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(94.110107%, 70.915222%, 75.079346%)"
                      offset="0.078125"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(93.743896%, 70.779419%, 75.267029%)"
                      offset="0.0859375"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(93.37616%, 70.645142%, 75.454712%)"
                      offset="0.09375"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(93.008423%, 70.509338%, 75.642395%)"
                      offset="0.101562"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(92.642212%, 70.373535%, 75.830078%)"
                      offset="0.109375"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(92.274475%, 70.239258%, 76.017761%)"
                      offset="0.117187"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(91.906738%, 70.103455%, 76.205444%)"
                      offset="0.125"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(91.540527%, 69.969177%, 76.391602%)"
                      offset="0.132812"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(91.172791%, 69.833374%, 76.579285%)"
                      offset="0.140625"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(90.805054%, 69.699097%, 76.766968%)"
                      offset="0.148438"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(90.438843%, 69.563293%, 76.954651%)"
                      offset="0.15625"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(90.071106%, 69.42749%, 77.142334%)"
                      offset="0.164062"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(89.704895%, 69.293213%, 77.330017%)"
                      offset="0.171875"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(89.337158%, 69.15741%, 77.5177%)"
                      offset="0.179688"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(88.969421%, 69.023132%, 77.705383%)"
                      offset="0.1875"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(88.60321%, 68.887329%, 77.893066%)"
                      offset="0.195312"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(88.235474%, 68.753052%, 78.079224%)"
                      offset="0.203125"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(87.867737%, 68.617249%, 78.266907%)"
                      offset="0.210937"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(87.501526%, 68.481445%, 78.45459%)"
                      offset="0.21875"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(87.133789%, 68.347168%, 78.642273%)"
                      offset="0.226562"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(86.766052%, 68.211365%, 78.829956%)"
                      offset="0.234375"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(86.399841%, 68.077087%, 79.017639%)"
                      offset="0.242188"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(86.032104%, 67.941284%, 79.205322%)"
                      offset="0.25"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(85.665894%, 67.805481%, 79.393005%)"
                      offset="0.257812"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(85.298157%, 67.671204%, 79.579163%)"
                      offset="0.265625"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(84.93042%, 67.5354%, 79.766846%)"
                      offset="0.273438"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(84.564209%, 67.401123%, 79.954529%)"
                      offset="0.28125"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(84.196472%, 67.26532%, 80.142212%)"
                      offset="0.289063"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(83.828735%, 67.131042%, 80.329895%)"
                      offset="0.296875"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(83.462524%, 66.995239%, 80.517578%)"
                      offset="0.304688"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(83.094788%, 66.859436%, 80.705261%)"
                      offset="0.3125"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(82.727051%, 66.725159%, 80.892944%)"
                      offset="0.320313"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(82.36084%, 66.589355%, 81.079102%)"
                      offset="0.328125"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(81.993103%, 66.455078%, 81.266785%)"
                      offset="0.335937"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(81.625366%, 66.319275%, 81.454468%)"
                      offset="0.34375"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(81.259155%, 66.184998%, 81.642151%)"
                      offset="0.351562"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(80.891418%, 66.049194%, 81.829834%)"
                      offset="0.359375"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(80.525208%, 65.913391%, 82.017517%)"
                      offset="0.367187"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(80.157471%, 65.779114%, 82.2052%)"
                      offset="0.375"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(79.789734%, 65.643311%, 82.392883%)"
                      offset="0.382812"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(79.423523%, 65.509033%, 82.580566%)"
                      offset="0.390625"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(79.055786%, 65.37323%, 82.766724%)"
                      offset="0.398437"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(78.688049%, 65.238953%, 82.954407%)"
                      offset="0.40625"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(78.321838%, 65.103149%, 83.14209%)"
                      offset="0.411837"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(78.138733%, 65.036011%, 83.236694%)"
                      offset="0.414062"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(77.954102%, 64.967346%, 83.329773%)"
                      offset="0.421875"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(77.586365%, 64.833069%, 83.517456%)"
                      offset="0.429687"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(77.220154%, 64.697266%, 83.705139%)"
                      offset="0.4375"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(76.852417%, 64.562988%, 83.892822%)"
                      offset="0.445312"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(76.486206%, 64.427185%, 84.080505%)"
                      offset="0.453125"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(76.118469%, 64.292908%, 84.266663%)"
                      offset="0.460937"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(75.750732%, 64.157104%, 84.454346%)"
                      offset="0.46875"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(75.384521%, 64.021301%, 84.642029%)"
                      offset="0.476562"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(75.016785%, 63.887024%, 84.829712%)"
                      offset="0.484375"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(74.649048%, 63.751221%, 85.017395%)"
                      offset="0.492188"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(74.282837%, 63.616943%, 85.205078%)"
                      offset="0.5"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(73.9151%, 63.48114%, 85.392761%)"
                      offset="0.507812"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(73.547363%, 63.345337%, 85.580444%)"
                      offset="0.515625"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(73.181152%, 63.21106%, 85.766602%)"
                      offset="0.523438"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(72.813416%, 63.075256%, 85.954285%)"
                      offset="0.53125"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(72.445679%, 62.940979%, 86.141968%)"
                      offset="0.539063"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(72.079468%, 62.805176%, 86.329651%)"
                      offset="0.546875"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(71.711731%, 62.670898%, 86.517334%)"
                      offset="0.554688"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(71.34552%, 62.535095%, 86.705017%)"
                      offset="0.5625"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(70.977783%, 62.399292%, 86.8927%)"
                      offset="0.570313"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(70.610046%, 62.265015%, 87.080383%)"
                      offset="0.578125"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(70.243835%, 62.129211%, 87.268066%)"
                      offset="0.585938"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(69.876099%, 61.994934%, 87.454224%)"
                      offset="0.588163"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(69.692993%, 61.927795%, 87.548828%)"
                      offset="0.59375"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(69.508362%, 61.859131%, 87.641907%)"
                      offset="0.601562"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(69.142151%, 61.724854%, 87.82959%)"
                      offset="0.609375"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(68.774414%, 61.58905%, 88.017273%)"
                      offset="0.617188"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(68.406677%, 61.453247%, 88.204956%)"
                      offset="0.625"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(68.040466%, 61.31897%, 88.392639%)"
                      offset="0.632812"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(67.672729%, 61.183167%, 88.580322%)"
                      offset="0.640625"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(67.306519%, 61.048889%, 88.768005%)"
                      offset="0.648438"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(66.938782%, 60.913086%, 88.954163%)"
                      offset="0.65625"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(66.571045%, 60.778809%, 89.141846%)"
                      offset="0.664062"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(66.204834%, 60.643005%, 89.329529%)"
                      offset="0.671875"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(65.837097%, 60.507202%, 89.517212%)"
                      offset="0.679688"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(65.46936%, 60.372925%, 89.704895%)"
                      offset="0.6875"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(65.103149%, 60.237122%, 89.892578%)"
                      offset="0.695312"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(64.735413%, 60.102844%, 90.080261%)"
                      offset="0.703125"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(64.367676%, 59.967041%, 90.267944%)"
                      offset="0.710938"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(64.001465%, 59.832764%, 90.454102%)"
                      offset="0.71875"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(63.633728%, 59.69696%, 90.641785%)"
                      offset="0.726562"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(63.265991%, 59.561157%, 90.829468%)"
                      offset="0.734375"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(62.89978%, 59.42688%, 91.017151%)"
                      offset="0.742188"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(62.532043%, 59.291077%, 91.204834%)"
                      offset="0.75"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(62.165833%, 59.156799%, 91.392517%)"
                      offset="0.757812"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(61.798096%, 59.020996%, 91.5802%)"
                      offset="0.765625"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(61.430359%, 58.885193%, 91.767883%)"
                      offset="0.773437"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(61.064148%, 58.750916%, 91.955566%)"
                      offset="0.78125"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(60.696411%, 58.615112%, 92.141724%)"
                      offset="0.789062"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(60.328674%, 58.480835%, 92.329407%)"
                      offset="0.796875"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(59.962463%, 58.345032%, 92.51709%)"
                      offset="0.804687"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(59.594727%, 58.210754%, 92.704773%)"
                      offset="0.8125"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(59.22699%, 58.074951%, 92.892456%)"
                      offset="0.820312"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(58.860779%, 57.939148%, 93.080139%)"
                      offset="0.828125"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(58.493042%, 57.804871%, 93.267822%)"
                      offset="0.835937"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(58.126831%, 57.669067%, 93.455505%)"
                      offset="0.84375"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(57.759094%, 57.53479%, 93.641663%)"
                      offset="0.851562"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(57.391357%, 57.398987%, 93.829346%)"
                      offset="0.859375"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(57.025146%, 57.264709%, 94.017029%)"
                      offset="0.867187"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(56.65741%, 57.128906%, 94.204712%)"
                      offset="0.875"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(56.289673%, 56.993103%, 94.392395%)"
                      offset="0.882812"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(55.923462%, 56.858826%, 94.580078%)"
                      offset="0.890625"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(55.555725%, 56.723022%, 94.767761%)"
                      offset="0.898437"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(55.187988%, 56.588745%, 94.955444%)"
                      offset="0.90625"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(54.821777%, 56.452942%, 95.141602%)"
                      offset="0.914062"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(54.454041%, 56.318665%, 95.329285%)"
                      offset="0.921875"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(54.086304%, 56.182861%, 95.516968%)"
                      offset="0.929687"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(53.720093%, 56.047058%, 95.704651%)"
                      offset="0.9375"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(53.352356%, 55.912781%, 95.892334%)"
                      offset="0.945312"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(52.986145%, 55.776978%, 96.080017%)"
                      offset="0.953125"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(52.618408%, 55.6427%, 96.2677%)"
                      offset="0.960938"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(52.250671%, 55.506897%, 96.455383%)"
                      offset="0.96875"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(51.88446%, 55.371094%, 96.643066%)"
                      offset="0.976562"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(51.516724%, 55.236816%, 96.829224%)"
                      offset="0.984375"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(51.148987%, 55.101013%, 97.016907%)"
                      offset="0.992188"
                    />
                    <stop
                      stopOpacity="1"
                      stopColor="rgb(50.782776%, 54.966736%, 97.20459%)"
                      offset="1"
                    />
                  </linearGradient>
                </defs>
                <g clipPath="url(#941f7a3cc7)">
                  <rect
                    x="-37.5"
                    fill="url(#ece5086a88)"
                    width="450"
                    y="-37.499999"
                    height="449.999989"
                  />
                </g>
              </svg>
              <p className="text-lg font-semibold text-white">WalkWithMe</p>
            </Link>
          </div>
        </header>
      </div>

      <section className="container mx-auto max-w-sm p-5 flex flex-col justify-center items-center flex-grow space-y-5">
        <h1 className="text-3xl font-medium w-full text-left">
          Let's get started
        </h1>
        <div className="space-y-2 w-full">
          <button
            className="rounded-sm border border-gray-400 w-full h-14 flex flex-row items-center justify-center space-x-2 hover:bg-gray-100"
            onClick={signInWithGoogle}
          >
            <img alt="google" src="/assets/images/google.svg"></img>
            <span>Sign in with Google</span>
          </button>
        </div>
      </section>

      <footer className="bg-slate-50 w-full mt-auto">
        <div className="container mx-auto h-full max-w-6xl space-y-10 py-12 px-8 md:px-4">
          <div className="flex flex-col items-center justify-center gap-10 md:grid md:grid-cols-3 text-gray-500">
            <Link className="h-full space-x-2" to="/">
              <p className="text-lg font-semibold">WalkWithMe</p>
            </Link>
            <div className="h-full">
              <h1 className="pb-2 text-base text-gray-400">Quick Links</h1>
              <ul>
                <li className="text-center md:text-left">
                  <a
                    className="text-sm text-gray-600 hover:text-blue-500"
                    href="/walk"
                  >
                    Get Walking
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col justify-between space-y-1 text-center text-xs text-gray-500 sm:flex-row sm:space-y-0 md:text-left ">
            {/* <p>© {new Date().getFullYear()}</p> */}
            <p>Made with ❤️ by the WalkWithMe Team</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
