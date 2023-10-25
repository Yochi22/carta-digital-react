import routesAdmin from "./routes.admin";
import routesClient from "./routes-client";
import { Error404 } from "../pages";
import {BasicLayout} from "../layouts/BasicLayout";

const routes = [
  ...routesAdmin,
  ...routesClient,
  {
    layout: BasicLayout,
    component: Error404,
  },
];

export default routes;