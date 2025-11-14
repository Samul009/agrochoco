import { Redirect } from "expo-router";

export default function Index() {
  // Redirige automáticamente a la pantalla de inicio de sesión
  return <Redirect href="/inicio-sesion" />;
}
