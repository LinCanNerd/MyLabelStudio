import { useCallback, useContext } from "react";
import { Button, Columns } from "../../../components";
import { confirm, modal } from "../../../components/Modal/Modal";
import { Spinner } from "../../../components/Spinner/Spinner";
import { ApiContext } from "../../../providers/ApiProvider";
import { projectAtom } from "../../../providers/ProjectProvider";
import { StorageCard } from "./StorageCard";
import { StorageForm } from "./StorageForm";
import { useAtomValue } from "jotai";
import { useStorageCard } from "./hooks/useStorageCard";

export const StorageSet = ({ title, target, rootClass, buttonLabel }) => {
  const api = useContext(ApiContext);
  const project = useAtomValue(projectAtom);
  const storageTypesQueryKey = ["storage-types", target];
  const storagesQueryKey = ["storages", target, project?.id];

  const {
    storageTypes,
    storageTypesLoading,
    storageTypesLoaded,
    reloadStorageTypes,
    storages,
    storagesLoading,
    storagesLoaded,
    reloadStoragesList,
    loading,
    loaded,
    fetchStorages,
  } = useStorageCard(target, project?.id);

  const showStorageFormModal = useCallback(
    (storage) => {
      const action = storage ? "Edit" : "Add";
      const actionTarget = target === "export" ? "Target" : "Source";
      const title = `${action} ${actionTarget} Storage`;

      const modalRef = modal({
        title,
        closeOnClickOutside: false,
        style: { width: 760 },
        body: (
          <StorageForm
            target={target}
            storage={storage}
            project={project.id}
            rootClass={rootClass}
            storageTypes={storageTypes}
            onSubmit={async () => {
              await fetchStorages();
              modalRef.close();
            }}
          />
        ),
        footer: (
          <>
            Save completed annotations to Amazon S3, Google Cloud, Microsoft Azure, or Redis.
            <br />
            <a href="https://labelstud.io/guide/storage.html">See more in the documentation</a>.
          </>
        ),
      });
    },
    [project, fetchStorages, target, rootClass],
  );

  const onEditStorage = useCallback(
    async (storage) => {
      showStorageFormModal(storage);
    },
    [showStorageFormModal],
  );

  const onDeleteStorage = useCallback(
    async (storage) => {
      confirm({
        title: "Deleting storage",
        body: "This action cannot be undone. Are you sure?",
        buttonLook: "destructive",
        onOk: async () => {
          const response = await api.callApi("deleteStorage", {
            params: {
              type: storage.type,
              pk: storage.id,
              target,
            },
          });

          if (response !== null) fetchStorages();
        },
      });
    },
    [fetchStorages],
  );

  return (
    <Columns.Column title={title}>
      <div className={rootClass.elem("controls")}>
        <Button onClick={() => showStorageFormModal()} disabled={loading}>
          {buttonLabel}
        </Button>
      </div>

      {loading && !loaded ? (
        <div className={rootClass.elem("empty")}>
          <Spinner size={32} />
        </div>
      ) : storagesLoaded && storages.length === 0 ? null : (
        storages?.map?.((storage) => (
          <StorageCard
            key={storage.id}
            storage={storage}
            target={target}
            rootClass={rootClass}
            storageTypes={storageTypes}
            onEditStorage={onEditStorage}
            onDeleteStorage={onDeleteStorage}
          />
        ))
      )}
    </Columns.Column>
  );
};
