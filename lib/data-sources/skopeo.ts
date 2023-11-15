/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// core
import { exec as _exec } from "node:child_process";
import { promisify } from "node:util";

// async apis
const exec = promisify(_exec);

/* -----------------------------------------------------------------------------
 * public api
 * -------------------------------------------------------------------------- */

export interface ImagePlatform {
  architecture: string;
  os: string;
}

/**
 * Fetch the labels for a given image identifier.
 */
export const getImageLabels = async (
  imageIdentifier: string,
  { architecture, os }: ImagePlatform,
): Promise<any> => {
  const result = await execSkopeo<InspectImageResult>(
    `skopeo inspect --override-arch ${architecture} --override-os ${os} docker://${imageIdentifier}`,
  );

  return result.Labels;
};

/**
 * Fetch the available platforms for a given image identifier.
 */
export const getImagePlatforms = async (
  imageIdentifier: string,
): Promise<ImagePlatform[]> => {
  // will obtain manifests with multiple platforms
  const result = await execSkopeo<InspectRawResult>(
    `skopeo inspect --raw docker://${imageIdentifier}`,
  );

  // If no manifests are found, we know we have a single platform image and we
  // can fetch its details by passing the --config flag.
  if (result.manifests !== undefined) {
    return result.manifests
      .map((manifest) => manifest.platform)
      .filter(
        (platform) =>
          platform.architecture !== "unknown" && platform.os !== "unknown",
      ) as ImagePlatform[];
  }

  const { architecture, os } = await execSkopeo<InspectConfigResult>(
    `skopeo inspect --config docker://${imageIdentifier}`,
  );

  return [{ architecture, os }];
};

/* -----------------------------------------------------------------------------
 * helpers
 * -------------------------------------------------------------------------- */

/**
 * Small little helper to execute a skopeo command and parse the output as a
 * typed object.
 */
const execSkopeo = async <T>(command: string): Promise<T> => {
  const { stdout } = await exec(command);
  return JSON.parse(stdout) as T;
};

/* -----------------------------------------------------------------------------
 * types
 * -------------------------------------------------------------------------- */

interface InspectImageResult {
  Name: string;
  Digest: string;
  RepoTags: string[];
  Created: string;
  DockerVersion: string;
  Labels: Record<string, string>;
  Architecture: string;
  Os: string;
  Layers: string[];
  Env: string[];
  LayersData: InspectImageLayersData;
}

interface InspectImageLayersData {
  MIMEType: string;
  Digest: string;
  Size: number;
  Annotations: Record<string, string> | null;
}

interface InspectRawResult {
  schemaVersion: number;
  mediaType: string;
  manifests?: InspectRawManifest[];
}

interface InspectRawManifest {
  mediaType: string;
  digest: string;
  size: number;
  platform: { architecture?: string; os?: string };
}

interface InspectConfigResult {
  created: string;
  architecture: string;
  os: string;
  history: InspectConfigHistory[];
  config: {
    User: string;
    Env: string[];
    Cmd: string[];
    WorkingDir: string;
    Labels: Record<string, string>;
  };
  rootfs: {
    type: string;
    diff_ids: string[];
  };
}

interface InspectConfigHistory {
  created: string;
  created_by: string;
  empty_layer?: boolean;
}
