import React, { useCallback, useContext, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Context } from '../../context/ContextProvider';
import { useNavigate } from 'react-router-dom';

const LANGUAGES = ['JavaScript', 'C', 'C++'];
const LANG_VALUE = ['js', 'c', 'cpp'];

export function NewProjectModal({ isOpen, onClose, setLoading }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState(LANG_VALUE[0]);
  const [showAlert, setShowAlert] = useState(false);
  const [message, setMessage] = useState("");
  const { domain } = useContext(Context)
  const navigate = useNavigate()

  const showAlertFunc = useCallback((mess) => {
    setShowAlert(true)
    setMessage(mess)
    setTimeout(() => {
      setShowAlert(false)
    }, 2000);
  }, [setShowAlert, setMessage])

  const handleCreateProject = ({ name, description, language }) => {
    console.log("func")
    fetch(`${domain}/projects/create`, {
      method: "POST",
      headers: {
        "Content-type": "application/json"
      },
      body: JSON.stringify({ name, description, language }),
      credentials: "include"
    })
    .then(res => {
      if (res.status > 399) {
        showAlertFunc("Unable to create new project");
        return
      }
      else return res.json()
    })
    .then(data => {
      if (data) {
        console.log(data)
        navigate(`/playground?containerId=${data.data.containerId}`)
      }
    })
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleCreateProject({ name, description, language });
    setName('');
    setDescription('');
    setLanguage(LANG_VALUE[0]);
    setLoading(true)
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300">
            Project Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md bg-black border border-gray-800 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md bg-black border border-gray-800 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-1"
            required
          />
        </div>

        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-300">
            Programming Language
          </label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="mt-1 block w-full p-2 rounded-md bg-black border border-gray-800 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            {LANGUAGES.map((lang, index) => (
              <option key={lang} value={LANG_VALUE[index]}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black"
          >
            Create Project
          </button>
        </div>
      </form>
    </Modal>
  );
}